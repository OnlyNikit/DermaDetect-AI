// import { React, useState } from "react";
// import "../components/styles/register.css";
// import api from "../api/axios.js";
// import {toast} from "react-toastify"
// import { useNavigate } from "react-router-dom";

// const Register = () => {
//   const navigate = useNavigate();
//   let [registerFormData, setRegisterFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const handleChange = (event) => {
//     setRegisterFormData((currData) => {
//       return { ...currData, [event.target.name]: event.target.value };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // console.log(registerFormData);
//    if(registerFormData.password !== registerFormData.confirmPassword){
//     toast.error("password Don't match")

//     return;
//    }
//    const response =  await api.post("/auth/register",registerFormData);
//    toast.success(response.data.message);
//    navigate("/login");
//     // setRegisterFormData({
//     //   fullName: "",
//     //   email: "",
//     //   password: "",
//     //   confirmPassword: "",
//     // });
//   };

//   return (
//     <div className="stage-wrapper">
//       <div className="stage">
//         <div className="scan-panel">
//           <div className="scan-copy">
//             <div className="brand">
//               <span className="brand-dot"></span> DermaDetect AI
//             </div>

//             <h1>Early detection starts with a clear picture.</h1>

//             <p>
//               Create your account to start scanning, tracking, and understanding
//               skin changes over time.
//             </p>
//           </div>

//           <div className="scan-frame">
//             <div className="crosshair">
//               <span className="h"></span>
//               <span className="v"></span>
//             </div>

//             <div className="cell c1"></div>
//             <div className="cell c2"></div>
//             <div className="cell c3"></div>
//             <div className="cell c4"></div>
//             <div className="cell c5"></div>
//           </div>

//           <div className="status-line">Analyzing sample</div>
//         </div>

//         <div className="form-panel">
//           <div className="form-head">
//             <h2>Create your account</h2>
//             <p>It only takes a minute to get started.</p>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="field">
//               <label htmlFor="name">Full name</label>

//               <div className="input-wrap">
//                 <input
//                   id="name"
//                   value={registerFormData.fullName}
//                   onChange={handleChange}
//                   name="fullName"
//                   type="text"
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="field">
//               <label htmlFor="email">Email address</label>

//               <div className="input-wrap">
//                 <input
//                   id="email"
//                   type="email"
//                   value={registerFormData.email}
//                   onChange={handleChange}
//                   name="email"
//                   placeholder="you@example.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="field">
//               <label htmlFor="password">Password</label>

//               <div className="input-wrap">
//                 <input
//                   id="password"
//                   type="password"
//                   value={registerFormData.password}
//                   onChange={handleChange}
//                   name="password"
//                   placeholder="Create a password"
//                   required
//                 />
//               </div>

//               <p className="hint">Use at least 8 characters.</p>
//             </div>

//             <div className="field">
//               <label htmlFor="confirm">Confirm password</label>

//               <div className="input-wrap">
//                 <input
//                   id="confirm"
//                   type="password"
//                   value={registerFormData.confirmPassword}
//                   onChange={handleChange}
//                   name="confirmPassword"
//                   placeholder="Re-enter your password"
//                   required
//                 />
//               </div>
//             </div>

//             <button type="submit" className="submit-btn" id="submitBtn">
//               Create account
//             </button>
//           </form>

//           <div className="divider">
//             <span>OR</span>
//           </div>

//           <p className="login-row">
//             Already have an account? <a href="/login">Log in</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

import { React, useState } from "react";
import "../components/styles/register.css";
import api from "../api/axios.js";
import {toast} from "react-toastify"
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  let [registerFormData, setRegisterFormData] = useState({
    fullName: "Riya yadav",
    email: "riya01@gmail.com",
    password: "1234",
    confirmPassword: "1234",
    gender: "Female",
    age: "20",
    
  });

  const handleChange = (event) => {
    setRegisterFormData((currData) => {
      return { ...currData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(registerFormData);
   if(registerFormData.password !== registerFormData.confirmPassword){
    toast.error("password Don't match")

    return;
   }
   const response =  await api.post("/api/auth/register",registerFormData);
   toast.success(response.data.message);
   navigate("/login");
    // setRegisterFormData({
    //   fullName: "",
    //   email: "",
    //   password: "",
    //   confirmPassword: "",
    //   gender: "",
    //   age: "",
    //   height: "",
    //   weight: "",
    // });
  };

  return (
    <div className="stage-wrapper">
      <div className="stage">
        <div className="scan-panel">
          <div className="scan-copy">
            <div className="brand">
              <span className="brand-dot"></span> DermaDetect AI
            </div>

            <h1>Early detection starts with a clear picture.</h1>

            <p>
              Create your account to start scanning, tracking, and understanding
              skin changes over time.
            </p>
          </div>

          <div className="scan-frame">
            <div className="crosshair">
              <span className="h"></span>
              <span className="v"></span>
            </div>

            <div className="cell c1"></div>
            <div className="cell c2"></div>
            <div className="cell c3"></div>
            <div className="cell c4"></div>
            <div className="cell c5"></div>
          </div>

          <div className="status-line">Analyzing sample</div>
        </div>

        <div className="form-panel">
          <div className="form-head">
            <h2>Create your account</h2>
            <p>It only takes a minute to get started.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>

              <div className="input-wrap">
                <input
                  id="name"
                  value={registerFormData.fullName}
                  onChange={handleChange}
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>

              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  value={registerFormData.email}
                  onChange={handleChange}
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="gender">Gender</label>

                <div className="input-wrap">
                  <select
                    id="gender"
                    value={registerFormData.gender}
                    onChange={handleChange}
                    name="gender"
                    required
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="age">Age</label>

                <div className="input-wrap">
                  <input
                    id="age"
                    type="number"
                    value={registerFormData.age}
                    onChange={handleChange}
                    name="age"
                    placeholder="Years"
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>
            </div>


            <div className="field">
              <label htmlFor="password">Password</label>

              <div className="input-wrap">
                <input
                  id="password"
                  type="password"
                  value={registerFormData.password}
                  onChange={handleChange}
                  name="password"
                  placeholder="Create a password"
                  required
                />
              </div>

              <p className="hint">Use at least 8 characters.</p>
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm password</label>

              <div className="input-wrap">
                <input
                  id="confirm"
                  type="password"
                  value={registerFormData.confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" id="submitBtn">
              Create account
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <p className="login-row">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;