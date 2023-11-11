import React from "react";
import Container from "./Container";
import { FieldIds } from "./constants";
import { Button } from "@/components/ui/button"


const UserForm = ({
  saveForm,
}) => {
  async function handleOnClick(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {};

    for (let entry of formData.entries()) {
      userData[entry[0]] = entry[1];
    }
    saveForm(userData)
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
        <Button variant="outline">
          Save Data
        </Button>
        <button className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48">
          Save Data
        </button>
      </form>
    </Container>
  );
};
export default UserForm;
