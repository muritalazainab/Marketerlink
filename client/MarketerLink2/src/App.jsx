import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Add from "./pages/Add/Add";
import Orders from "./pages/orders/Order";
import Messages from "./pages/messages/Messages"
import Message from "./pages/message/Message";
import ProfileForm from "./components/ProfileForm/ProfileForm";
import MarketerProfileView from "./components/MarketerProfileView/MarketerProfileView";
import ProjectDashboard from './projects/ProjectDashboard';
import ReviewInterface from './projects/SubmissionCountdownComponent';
import SubmissionCountdownComponent  from './projects/SubmissionCountdownComponent';
import { ToastProvider } from './components/ToastNotification';
import WorkSubmissionDashboard from './components/WorkSubmissionDashboard';
import WorkReviewDashboard from './components/WorkReviewDashboard'; 
import PlatformEarningsTracker from './components/PlatformEarningsTracker';
import AdminRegister from './pages/AdminRegister';
import MarketerDashboard from "./components/marketerDashboard/MarketerDashboard";
import SellerDashboard from "./components/sellerDashboard/SellerDashboard";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Pay from "./pages/pay/Pay";
import Success from "./pages/success/Success";

function App() {
  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <div className="app">
        <ToastProvider> 
          <QueryClientProvider client={queryClient}>
            <Navbar />
            <Outlet />
          </QueryClientProvider>
        </ToastProvider>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/gigs",
          element: <Gigs />,
        },
        {
          path: "/myGigs",
          element: <Gigs />,
        },
        {
          path: "/orders",
          element: <Orders />,
        },
        {
          path: "/messages",
          element:<Messages/>,
        },
        {
          path: "/message/:id",
          element: <Message />,
        },
        {
          path: "/add",
          element: <Add />,
        },
        {
          path: "/gig/:id",
          element: <Gig />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/pay/:id",
          element: <Pay />,
        },
        {
          path: "/success",
          element: <Success />,
        },
        {
           path:"/seller-dashboard",
            element:<SellerDashboard />
        },
        {
          path:"/marketer-dashboard" ,
         element:<MarketerDashboard />
        },
        {
           path:"/project/:id",
            element:<ProjectDashboard />
           },
        {path:"/project/:id/submit",
          element:< SubmissionCountdownComponent/>
            }, 
          {path:"/project/:id/review",
             element:<ReviewInterface />
            },
            {path:"/work-submission",
             element:<WorkSubmissionDashboard />}, 
             { path:"/work-review", 
              element:<WorkReviewDashboard />},
        {path:"/platform-earnings",
   element:<PlatformEarningsTracker />} ,

        {
  path: "/create-profile",
  element: <ProfileForm />
},
     { path:"/admin-register",
       element:<AdminRegister />},

{
  path: "/profile/:userId", 
  element: <MarketerProfileView />
}
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

// i have update it all
export default App;