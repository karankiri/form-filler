import React, { useEffect, useState } from "react";
import UserForm from "./Form";
import Container from "./Container";
import { FieldIds } from "./constants";
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TypographyH2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons"



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
      <TypographyH2>Let's Apply for Some Jobs</TypographyH2>
      <div className="flex gap-4 pb-4">
        <Button variant="outline" disabled={loading} onClick={handleOnClick}>
          {loading ? <>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Filling form for you
          </> : `Fill Form For me`}
        </Button>
        <Button variant="outline" onClick={resetLocalStorage}>
          Clear data
        </Button>
      </div>
      <TooltipProvider>
        <div className="badgeContainer">
          {Object.keys(userData).map((key) => (
            <div key={key}>
              <Tooltip>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userData[key]);
                  }}
                >
                  <TooltipTrigger>
                    <Badge style={{ textTransform: 'capitalize' }}>{key.toLowerCase()}</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Click to copy
                  </TooltipContent>
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </Container>
  );
};
export default App;
