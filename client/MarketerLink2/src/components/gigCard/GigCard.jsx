import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  DollarSign, 
  User, 
  CheckCircle, 
  Send,
  MessageCircle,
  Eye,
  MapPin,
  Heart,
  FileText
} from 'lucide-react';

const GigCard = ({ 
  item, 
  hasApplied, 
  applicationStatus, 
  conversationId, 
  isInProgress, 
  currentUser 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text || '';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Compact Image Section */}
      <div className="relative">
        <div className="h-48 overflow-hidden">
          <img
            src={item?.cover || '/api/placeholder/400/200'}
            alt={item?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Status Badge */}
        {hasApplied && applicationStatus && (
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(applicationStatus)}`}>
              {applicationStatus.toUpperCase()}
            </span>
          </div>
        )}

        {/* Favorite Icon */}
        <button className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-bold text-gray-900">
              Starting at ${item?.price}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {item?.userId?.img ? (
              <img 
                src={item.userId.img} 
                alt={item?.userId?.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item?.userId?.username}
            </p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {item?.totalStars ? (item.totalStars / item.starNumber).toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-gray-400">
                ({item?.starNumber || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {truncateText(item?.title, 60)}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {truncateText(item?.desc, 100)}
        </p>

        {/* Features/Tags */}
        {item?.features && item.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {item.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
              >
                {feature}
              </span>
            ))}
            {item.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{item.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Delivery Time & Category */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{item?.deliveryTime} days delivery</span>
          </div>
          {item?.cat && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="capitalize">{item.cat}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!hasApplied ? (
            <div className="flex gap-2">
              <Link
                to={`/gig/${item?._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                style={{ backgroundColor: '#2563EB' }}
              >
                <Eye className="w-4 h-4" />
                View 
              </Link>
              <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {applicationStatus === 'pending' && (
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Application Pending
                </div>
              )}
              
              {applicationStatus === 'accepted' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Project Active
                  </div>
                  <div className="flex gap-2">
                    {/* <Link
                      to={`/gig/${item?._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Project
                    </Link> */}
                      
  {/* <Link
    to={`/project/${item._id}/submit`}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
  >
    <FileText className="w-4 h-4" />
    Submit Work
  </Link> */}
                    {/* <Link
                      to="/messages"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                      style={{ backgroundColor: '#F97316' }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with Client
                    </Link> */}
                  </div>
                </div>
              )}
              
              {/* {!applicationStatus && (
                <Link
                  to={`/gig/${item?._id}`}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigCard;