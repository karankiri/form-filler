import browser from "webextension-polyfill";
import { useState } from "react";

const UserData = {
  firstName: "Virat",
  lastName: "Kohli",
  email: "viratkohli@mailinator.com",
  phone: "+91987654321",
  linkedIn: "https://linkedin.com/in/viratkohli",
  website: "https://viratkohli.com",
  twitter: "https://twitter.com/vkohli",
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
};

const formFiller = (allInputs) => {
  [...allInputs].map((input) => {
    for (let key in FieldIds) {
      FieldIds[key].map((field) => {
        if (input.name.toLowerCase().includes(field.toLowerCase())) {
          input.value = UserData[key];
        }
      });
    }
  });
};

const App = () => {
  const [fact, setFact] = useState("Click the button to fetch a fact!");
  const [loading, setLoading] = useState(false);

  async function handleOnClick() {
    const allInput = document.querySelectorAll("input");
    formFiller(allInput);
  }

  return (
    <div className="absolute top-20 left-20">
      <div className="flex flex-col gap-4 p-4 shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 w-96 rounded-md">
        <h1>Cat Facts!</h1>
        <button
          className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48"
          disabled={loading}
          onClick={handleOnClick}
        >
          Get a Cat Fact!
        </button>
        <p className="text-white">{fact}</p>
      </div>
    </div>
  );
};
export default App;
