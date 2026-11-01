import React, { useEffect, useState } from "react";
import UserForm from "./Form";
import Container from "./Container";
import type { FillResult } from "./constants";
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TypographyH2, TypographyH3, TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons"



const App = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>();
  const [start, setStart] = useState(true);
  const [filled, setFilled] = useState<FillResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    chrome.storage.local.get(["formFillerData"]).then((result) => {
      if (result.formFillerData) {
        setUserData(result.formFillerData);
      }
      setLoading(false);
    });
  }, []);

  function handleOnClick() {
    setLoading(true);
    setError(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId == null) {
        setError("No active tab found");
        setLoading(false);
        return;
      }
      chrome.tabs.sendMessage(tabId, { from: "popup", subject: "fillForm" }, (response) => {
        setLoading(false);
        if (chrome.runtime.lastError || !response) {
          setError("Could not reach this page. Reload the tab and try again.");
          return;
        }
        if (!response.ok) {
          setError(response.error || "Something went wrong");
          return;
        }
        setFilled({ filled: response.filled, candidates: response.candidates });
      });
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


  if (!start) return;
  if (loading) return <div className="absolute top-20 right-20">Loading</div>;
  if (filled) return (<Container>
    <TypographyH3>
      {filled.filled > 0
        ? `Filled ${filled.filled} field${filled.filled === 1 ? "" : "s"} for you`
        : "No matching fields found on this page"}
    </TypographyH3>
    <TypographyP>
      {filled.candidates === 0
        ? "This page has no visible form fields. Open the application form first."
        : "Please double-check the form before submitting."}
    </TypographyP>
    <TypographyP>
      Found any issue? Please report it
      <a href="https://github.com/karankiri/form-filler/issues" target="_blank">
        <Button variant="link" style={{ paddingLeft: '4px' }}>here</Button>
      </a>
    </TypographyP>
    <Button variant="outline" onClick={() => setFilled(null)}>Back</Button>
  </Container>)
  if (!userData) return <UserForm saveForm={saveForm} />;
  return (
    <Container>
      <TypographyH2>Let's Apply for Some Jobs</TypographyH2>
      {error && <p className="text-sm text-destructive pb-2">{error}</p>}
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
                <div
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
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </Container>
  );
};
export default App;
