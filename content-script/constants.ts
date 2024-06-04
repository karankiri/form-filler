export const FieldIds = {
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

export const formFiller = (allInputs, userData) => {
  console.log("🚀 ~ formFiller ~ allInputs:", allInputs);
  [...allInputs].map((input) => {
    console.log("🚀 ~ [...allInputs].map ~ input:", input)
    for (let key in FieldIds) {
      FieldIds[key].map((field) => {
        if (input.name?.toLowerCase().includes(field.toLowerCase())) {
          input.value = userData[key];
        }
      });
    }
    if (
      input.name?.toLowerCase().includes("fullname".toLowerCase()) ||
      input.name?.toLowerCase() === "name"
    ) {
      input.value = `${userData.firstName} ${userData.lastName}`;
    }
  });
};