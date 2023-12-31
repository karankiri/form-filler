import React from "react";

const Container = ({ children }) => {
  return (
    <div className="top-0 right-0 overflow-y-auto shadow-sm rounded-md p-5 bg-background text-foreground" style={{ zIndex: 500000 }}>
      <div className="flex justify-center">
        <img src="FF-logo.png" width={"32px"} height={"32px"} />
      </div>
      <div className="flex flex-col p-4 filler-container">
        {children}
      </div>
    </div>
  );
};
export default Container;
