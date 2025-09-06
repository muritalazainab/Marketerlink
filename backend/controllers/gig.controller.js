import Gig from "../models/gig.model.js";
import Stripe from "stripe";
import createError from "../utils/createError.js";


export const createGig = async (req, res, next) => {
    console.log("🔍 CREATE GIG START");
  console.log("🔍 req.userId:", req.userId);
  console.log("🔍 req.isSeller:", req.isSeller);
  console.log("🔍 req.body:", req.body);
  if (!req.isSeller){

    console.log("❌ User is not a seller");

return next(createError(403, "Only sellers can create a gig!"));
  }

  try {
    // 1. Create a Stripe Payment Intent
        console.log("🔍 Creating Stripe payment intent...");

    const stripe = new Stripe(process.env.STRIPE);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.price * 100, // Stripe expects cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'gig_escrow',
        userId: req.userId
      }
    });

    console.log("✅ Stripe payment intent created");

    console.log("🔍 Creating gig in database...");

    // 2. Create gig with escrow info (but not funded yet)
    const newGig = new Gig({
      userId: req.userId,
      ...req.body,
      escrowAmount: req.body.price,   
      isFunded: false,                // Will be true after payment succeeds
      paymentIntentId: paymentIntent.id,
      status: 'pending_payment'       // Add status field
    });

    const savedGig = await newGig.save();
    console.log("✅ Gig saved to database");

    // 3. Send client secret so frontend can confirm payment
    res.status(201).json({
      gig: savedGig,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
      console.error("❌ CREATE GIG ERROR:", err);
    console.error("❌ Error details:", err.message);
    
    next(err);
  }
};


// New endpoint to mark gig as funded after successful payment
// Fixed fundGig function
export const fundGig = async (req, res, next) => {
  try {
    console.log("Funding gig:", req.params.id);
    console.log("Current user:", req.userId);
    
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }
    
    console.log("Gig owner:", gig.userId);
    console.log("Types - gig.userId:", typeof gig.userId, "req.userId:", typeof req.userId);
    console.log("String comparison:", gig.userId.toString(), "===", req.userId.toString());
    console.log("Comparison result:", gig.userId.toString() === req.userId.toString());

    // ✅ Fixed: Ensure both are strings for comparison
    if (gig.userId.toString() !== req.userId.toString()) {
      console.log("❌ Authorization failed - user mismatch");
      return next(createError(403, "You can only fund your own gigs!"));
    }

    // ✅ Fixed: Initialize Stripe instance
    const stripe = new Stripe(process.env.STRIPE);

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(req.body.paymentIntentId);
    
    if (paymentIntent.status === 'succeeded' && paymentIntent.id === gig.paymentIntentId) {
      // Mark gig as funded and active
      gig.isFunded = true;
      gig.status = 'active';
      await gig.save();
      
      console.log("✅ Gig funded successfully");
      res.status(200).json({ message: "Gig funded successfully!", gig });
    } else {
      console.log("❌ Payment verification failed");
      return next(createError(400, "Payment verification failed!"));
    }
  } catch (err) {
    console.error("Funding error:", err);
    next(err);
  }
};
export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }
    
    if (gig.userId !== req.userId) {
      return next(createError(403, "You can delete only your gig!"));
    }

    // If gig is funded, we might want to handle refund here
    if (gig.isFunded && gig.paymentIntentId) {
      try {
        // Refund the escrow amount
        await stripe.refunds.create({
          payment_intent: gig.paymentIntentId,
        });
      } catch (stripeError) {
        console.error("Refund failed:", stripeError);
        // You might want to handle this differently - maybe just log and continue
      }
    }

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};

export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) next(createError(404, "Gig not found!"));
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
};

export const getGigs = async (req, res, next) => {
  const q = req.query;
  const filters = {
    // Only show funded/active gigs to buyers
    isFunded: true,
    status: 'active',
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    ...((q.min || q.max) && {
      price: {
        ...(q.min && { $gt: q.min }),
        ...(q.max && { $lt: q.max }),
      },
    }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };

  try {
    const gigs = await Gig.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(gigs);
  } catch (err) {
    next(err);
  }
};

// Get seller's own gigs (including unfunded ones)
export const getMyGigs = async (req, res, next) => {
  if (!req.isSeller) {
    return next(createError(403, "Only sellers can view their gigs!"));
  }

  try {
    const gigs = await Gig.find({ userId: req.userId });
    res.status(200).send(gigs);
  } catch (err) {
    next(err);
  }
};