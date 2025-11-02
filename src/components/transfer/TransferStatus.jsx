import React from 'react';

const TransferStatus = ({ status }) => {
  const { message, progress, error, url } = status;

  return (
    <div className="space-y-3">
      <p className={`text-lg ${error ? 'text-red-500' : 'text-green-500'}`}>
        {message}
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${error ? 'bg-red-500' : 'bg-indigo-500'}`}
          style={{ width: `${progress}%`, transition: 'width 0.5s' }}
        ></div>
      </div>
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View Playlist
        </a>
      )}
    </div>
  );
};

export default TransferStatus;