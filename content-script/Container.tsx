import React from "react";

const Container = ({ children }) => {
  return (
    <div className="absolute top-0 right-0 overflow-y-scroll" style={{ zIndex: 500000 }}>
      <div className="flex flex-col p-4 shadow-sm rounded-md" style={{ width: '450px' }}>
        {children}
      </div>
    </div>
  );
};
export default Container;
