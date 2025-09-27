export const getPlatformEarnings = async (req, res, next) => {
  try {
    // Get total platform earnings
    const totalEarnings = await PlatformEarnings.aggregate([
      { $match: { status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);

    // Get recent transactions
    const recentTransactions = await PlatformEarnings.find({ status: 'processed' })
      .populate('gigId', 'title')
      .populate('marketerId', 'username')
      .populate('sellerId', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get monthly earnings
    const monthlyEarnings = await PlatformEarnings.aggregate([
      { $match: { status: 'processed' } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          earnings: { $sum: '$platformFee' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      totalEarnings: totalEarnings[0]?.total || 0,
      recentTransactions,
      monthlyEarnings
    });
  } catch (error) {
    next(error);
  }
};