import React from "react";

const Container = ({ children }) => {
  return (
    <div className="absolute top-0 right-0 overflow-y-scroll" style={{ zIndex: 500000 }}>
      <div className="flex flex-col gap-4 p-4 shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 w-96 rounded-md">
        {children}
      </div>
    </div>
  );
};
export default Container;
