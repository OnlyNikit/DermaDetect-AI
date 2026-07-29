  import React from "react";
  import "../styles/globals.css"

  function Button({children}) {
    return (
      <>
       
        
            <button type="submit" className="primary-btn">
              {children}
            </button>
        
        
      </>
    );
  }

export default Button;
