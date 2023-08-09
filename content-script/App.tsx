import browser from "webextension-polyfill";
import React, { useEffect, useState } from "react";
import UserForm from "./Form";
import Container from "./Container";

const UserData = {
  firstName: "Virat",
  lastName: "Kohli",
  email: "viratkohli@mailinator.com",
  phone: "+91987654321",
  linkedIn: "https://linkedin.com/in/viratkohli",
  website: "https://viratkohli.com",
  twitter: "https://twitter.com/vkohli",
  github: "https://github.com/vkohli",
  company: "RCB",
};

const FieldIds = {
  firstName: ["first_name", "firstname"],
  lastName: ["last_name", "lastname"],
  email: ["email"],
  phone: ["phone"],
  linkedIn: ["linkedIn"],
  github: ["github"],
  website: ["portfolio", "personal", "website"],
  twitter: ["twitter"],
  company: ["org", "organization", "company"],
};

const formFiller = (allInputs, userData) => {
  [...allInputs].map((input) => {
    for (let key in FieldIds) {
      FieldIds[key].map((field) => {
        if (input.name.toLowerCase().includes(field.toLowerCase())) {
          input.value = UserData[key];
        }
      });
    }
    if (
      input.name.toLowerCase().includes("fullname".toLowerCase()) ||
      input.name.toLowerCase() === "name"
    ) {
      input.value = `${UserData.firstName} ${UserData.lastName}`;
    }
  });
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState();

  useEffect(() => {
    setLoading(true);
    chrome.storage.local.get(["formFillerData"]).then((result) => {
      if (result.formFillerData) {
        setUserData(result.formFillerData);
      }
      setLoading(false);
    });
  }, []);

  async function handleOnClick() {
    const allInput = document.querySelectorAll("input");
    formFiller(allInput, userData);
  }

  if (loading) return <div className="absolute top-20 right-20">Loading</div>;
  if (userData) return <UserForm />;

  return (
    <Container>
      <h1>Let's Apply for Some Jobs</h1>
      <button
        className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48"
        disabled={loading}
        onClick={handleOnClick}
      >
        Fill Form For me
      </button>
      <div>
        {Object.keys(UserData).map((key) => (
          <div key={key}>
            <label>{key}</label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(UserData[key]);
              }}
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </Container>
  );
};
export default App;
