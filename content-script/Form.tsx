import React from "react";
import Container from "./Container";
import { FieldIds } from "./constants";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TypographyH2, TypographyH3 } from '@/components/ui/typography'


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
      <TypographyH2>First Thing First!</TypographyH2>
      <TypographyH3>Tell Us about yourself</TypographyH3>
      <form onSubmit={handleOnClick}>
        <div className="inputRowsContainer">
          {Object.keys(FieldIds).map((key) => (
            <div key={key} className="mb-4">
              <Input
                name={key}
                type="text"
                placeholder={key.toLowerCase()}
              />
            </div>
          ))}
        </div>
        <Button variant="outline">
          Save Data
        </Button>
      </form>
    </Container>
  );
};
export default UserForm;
