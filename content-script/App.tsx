import React, { useEffect, useState } from "react";
import UserForm from "./Form";
import Container from "./Container";
import { FieldIds } from "./constants";


const formFiller = (allInputs, userData) => {
  [...allInputs].map((input) => {
    for (let key in FieldIds) {
      FieldIds[key].map((field) => {
        if (input.name.toLowerCase().includes(field.toLowerCase())) {
          input.value = userData[key];
        }
      });
    }
    if (
      input.name.toLowerCase().includes("fullname".toLowerCase()) ||
      input.name.toLowerCase() === "name"
    ) {
      input.value = `${userData.firstName} ${userData.lastName}`;
    }
  });
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>();

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
    setLoading(true);
    chrome.storage.local.get(["formFillerData"]).then((result) => {
      if (result.formFillerData) {
        setUserData(result.formFillerData);
        formFiller(allInput, result.formFillerData);
      }
      setLoading(false);
    });
  }

  async function resetLocalStorage() {
    chrome.storage.local.remove(["formFillerData"], function () {
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      } else {
        setUserData(undefined)
      }
    })
  }

  const saveForm = (data) => {
    chrome.storage.local.set({ formFillerData: data }).then(() => {
      console.log("Value is set");
      setUserData(data);
    });
  }

  if (loading) return <div className="absolute top-20 right-20">Loading</div>;
  if (!userData) return <UserForm saveForm={saveForm} />;

  return (
    <Container>
      <h1>Let's Apply for Some Jobs</h1>
      <button
        className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48"
        disabled={loading}
        onClick={handleOnClick}
      >
        {loading ? `Filling form...` : `Fill Form For me`}
      </button>
      <button
        onClick={resetLocalStorage}
        className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48"
      >
        Reset Data
      </button>
      <div>
        {Object.keys(userData).map((key) => (
          <div key={key}>
            <label>{key}</label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(userData[key]);
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
