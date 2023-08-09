import React from "react";
import Container from "./Container";

const FieldIds = {
  firstName: ["first_name", "firstname"],
  lastName: ["last_name", "lastname"],
  email: ["email"],
  phone: ["phone"],
  linkedIn: ["linkedIn"],
  github: ["github"],
  website: ["portfolio", "personal", "website"],
  twitter: ["twitter"],
};

const UserForm = () => {
  async function handleOnClick(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {};

    for (let entry of formData.entries()) {
      userData[entry[0]] = entry[1];
    }
    chrome.storage.local.set({ formFillerData: userData }).then(() => {
      console.log("Value is set");
    });
  }

  return (
    <Container>
      <h1>First Thing First!</h1>
      <h2>Tell Us about yourself</h2>
      <form onSubmit={handleOnClick}>
        {Object.keys(FieldIds).map((key) => (
          <div key={key} className="mb-4">
            <label className="block mb-2 text-sm text-gray-600 capitalize">
              {key}
            </label>
            <input
              name={key}
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        ))}
        <button className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48">
          Save Data
        </button>
      </form>
    </Container>
  );
};
export default UserForm;
