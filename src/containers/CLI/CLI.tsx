import React, { FunctionComponent, useState, useRef } from "react";

import store from "../../store/store";
import * as crmUtil from "../../helpers/crmutil";
import * as actionTypes from "../../store/actions";
import IsEmpty from "is-empty";
import { getCliData } from "../../services/CliParsingService";
import { PerformCrmAction } from "../../services/CLI/CrmCliService";
import { Terminal } from "../../components/UI/Terminal/Terminal";
import { CliResponse } from "../../interfaces/CliResponse";
import { CliData } from "../../interfaces/CliData";
import { Spinner } from "../../interfaces/Spinner";
import { TerminalOut } from "../../interfaces/TerminalOut";
import { getIntelliSenseForText, getUpdatedInputOnSelection } from "../../services/CLI/IntelliSense/IntelliSenseService"
import "./CLI.css";
import { number } from "prop-types";
import { CliIntelliSense, CLIVerb, ClientRect, IntelliSenseInput } from "../../interfaces/CliIntelliSense";
import input from "../../components/UI/Input/Input";
const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;
const KEYCODE_LEFT = 37;
const KEYCODE_RIGHT = 39;

const KEYCODE_HOME = 36;
const KEYCODE_END = 35;

export const CLI: React.FC = () => {
  const getDefaultIntellisenseState = (): CliIntelliSense => {
    return { results: Array<CLIVerb>(), currentPos: { left: 0, top: 0 } };
  }
  const cliInputRef = useRef();
  const intelliSensePositionCanvasRef = useRef(null);
  const [inputCaretPosition, setInputCaretPosition] = useState<number>(0);
  const [variables, setVariables] = useState<any>({});
  const [spinnerInfo, setSpinner] = useState<Spinner>({ show: false });
  const [inIntelliSenseNavMode, setIntelliSenseNavMode] = useState<boolean>(false);
  const [intelliSenseVerbCurrentIndex, setintelliSenseVerbCurrentIndex] = useState<number>(0);
  const [inputText, setInputText] = useState<string>("");
  const [outputs, setOutputs] = useState<Array<any>>([]);
  const [intellisenseResults, setIntelliSenseResults] = useState<CliIntelliSense>(getDefaultIntellisenseState());
  const [commandsHistoryCurrentIndex, setCommandsHistoryCurrentIndex] = useState<number>(-1);
  const [commandsHistory, setCommandsHistory] = useState<Array<string>>([]);


  const onTerminalInputBlur = async (ev: any) => {
    setIntelliSenseResults(getDefaultIntellisenseState());
  }

  const onTerminalIntellisenseItemClick = async (ev: any, result: CLIVerb) => {
    await retrieveAndSetIntelliSense(undefined, result);
  }

  const retrieveAndSetIntelliSense = async (inputtoUse?: string, result?: CLIVerb | undefined) => {

    console.log(`Entering retrieveAndSetIntelliSense...`);

    if (!result) {
      result = getSelectedCLIVerb();
    }


    let userInputText = inputtoUse ? inputtoUse : getCurrentTextInput();
    let intellisenseInput: IntelliSenseInput = { inputText: userInputText, inputCaretPosition: inputCaretPosition };

   
    

    let updatedIntelliSenseInput = await getUpdatedInputOnSelection(intellisenseInput, result);
   

    setInputText(updatedIntelliSenseInput.inputText);
    setIntelliSenseNavMode(false);

    let intellisenseInfo = await getIntelliSenseForText(updatedIntelliSenseInput);
    intellisenseInfo.currentPos = calculateIntelliSensePos(updatedIntelliSenseInput.inputCaretPosition);
    focusInputAndSetCaretPosition(updatedIntelliSenseInput.inputCaretPosition);
    setIntelliSenseResults(intellisenseInfo);
  

    setintelliSenseVerbCurrentIndex(0);
  }


  const focusInputAndSetCaretPosition = (caretPos?: number | undefined) => {
    if (cliInputRef && cliInputRef.current) {
      let currentRef = cliInputRef.current as any;
      let caretPosToUse = caretPos ? caretPos : inputCaretPosition;
      currentRef.focus();
      currentRef.setSelectionRange(caretPosToUse, caretPosToUse);
    }
  }

  const onTerminalInputKeyDown = async (ev: any) => {


    if (ev.key === "Tab") {
      ev.preventDefault();
      let userInputText = getCurrentTextInput();//We use space as a delimiter when trying to indentify the IntelliSenseType(e.g. Action, target, ActionParams etc.)
      retrieveAndSetIntelliSense(userInputText, undefined);
      return;
    }


    if (ev.keyCode === KEYCODE_ENTER && inIntelliSenseNavMode) {
      //a verb has been selected from the IntelliSense results, need to update the user text
      retrieveAndSetIntelliSense();
      return;
    }


    if (ev.keyCode === KEYCODE_LEFT || ev.keyCode === KEYCODE_RIGHT ||
      ev.keyCode === KEYCODE_HOME || ev.keyCode === KEYCODE_END) {
      resetIntelliSense();
      return;
    }

    if (inIntelliSenseNavMode) {
      ev.preventDefault();
      manageIntellisenseVerbNavigation(ev.keyCode);
      focusInputAndSetCaretPosition();
      return;
    }

    if (intellisenseResults.results && intellisenseResults.results.length > 0 && ev.keyCode === KEYCODE_DOWN) {
      setIntelliSenseNavMode(true);
      return;
    }

    if (ev.keyCode === KEYCODE_UP || ev.keyCode === KEYCODE_DOWN) {
      setCurrentCommandFromHistory(ev.keyCode);
      return;
    }

    if (ev.keyCode !== KEYCODE_ENTER) return;

    resetIntelliSense();

    const cliDataVal = getCliData(inputText) as CliData;
    let cliResponse: CliResponse = { type: "", success: false, message: "" };

    if (cliDataVal.action != null) {//special cases
      switch (cliDataVal.action.toLowerCase()) {
        case "cls":
        case "clear": clearTerminal();
          return;
      }
    }

    showProgressSpinner();
    cliResponse = await PerformCrmAction(cliDataVal);
    showActionResult(cliResponse, cliDataVal);
    hideProgressSpinner();
  };


  const resetIntelliSense = () => {
    setIntelliSenseNavMode(false);
    setIntelliSenseResults(getDefaultIntellisenseState());
    setintelliSenseVerbCurrentIndex(0);
  }

  const manageIntellisenseVerbNavigation = (keyCode: number) => {

    console.log(`Entering manageIntellisenseVerbNavigation...`);

    if (keyCode !== KEYCODE_UP && keyCode !== KEYCODE_DOWN) {
      resetIntelliSense();
      return;
    }


    let updatedIndex = intelliSenseVerbCurrentIndex;
    let maxIndex = intellisenseResults && intellisenseResults.results ? intellisenseResults.results.length - 1 : -1;
    if (keyCode === KEYCODE_UP) {
      updatedIndex -= 1;
    }
    else {
      updatedIndex += 1;
    }

    if (updatedIndex < 0) {
      updatedIndex = 0;
    }

    if (updatedIndex > maxIndex) {
      updatedIndex = maxIndex;
    }

    if (updatedIndex >= 0 && maxIndex !== -1) {

      let updatedIntellisenseInfo = { ...intellisenseResults };
      let previousSelectedItem = updatedIntellisenseInfo.results[intelliSenseVerbCurrentIndex];
      if (previousSelectedItem) {
        previousSelectedItem.isSelected = false;
      }

      let currentSelectedItem = updatedIntellisenseInfo.results[updatedIndex];
      if (currentSelectedItem) {
        currentSelectedItem.isSelected = true;
      }


      updatedIntellisenseInfo.currentIndex = updatedIndex;
      setIntelliSenseResults(updatedIntellisenseInfo);
      setintelliSenseVerbCurrentIndex(updatedIndex);
    }

  }


  const getSelectedCLIVerb = (): CLIVerb => {

    if (intellisenseResults && intellisenseResults.results) {
      let results = intellisenseResults.results;
      let result = results.find(x => x.isSelected);

      if (result)
        return result;
    }

    return { name: "" };
  }

  const calculateIntelliSensePos = (inputCaretPos: number): ClientRect => {

    let inputTxtRef: any = cliInputRef.current;
    var canvas: any = intelliSensePositionCanvasRef.current;
    var context = canvas.getContext("2d");
    context.font = "10pt Arial";

    let textToMeasure = inputTxtRef.value.substring(0, inputCaretPos);
    var metrics = context.measureText(textToMeasure);

    let inputRect = inputTxtRef.getBoundingClientRect();
    console.log(`Left:${inputRect.left}, width:${metrics.width}, Calculated Left Position: ${inputRect.left + metrics.width}`);
    return { left: metrics.width, top: inputRect.top };
  }

  const getCurrentTextInput = () => {
    let inputTxtRef: any = cliInputRef.current;
    return inputTxtRef.value;
  }


  const showProgressSpinner = () => {
    setSpinner({ show: true });
  }

  const hideProgressSpinner = () => {
    setSpinner({ show: false });

  }

  const setCurrentCommandFromHistory = (keyCode: number) => {

    let commandsHistoryArrLength = commandsHistory.length;

    if (commandsHistoryArrLength === 0)
      return;

    let updatedCommandsHistoryCurrentIndex = commandsHistoryCurrentIndex;
    if (keyCode === KEYCODE_DOWN) {
      updatedCommandsHistoryCurrentIndex = (updatedCommandsHistoryCurrentIndex + 1 >= commandsHistoryArrLength) ?
        commandsHistoryArrLength - 1 :
        ++updatedCommandsHistoryCurrentIndex;
    }
    else if (keyCode === KEYCODE_UP) {
      updatedCommandsHistoryCurrentIndex = (inputText === "") ? commandsHistoryArrLength - 1 :
        ((updatedCommandsHistoryCurrentIndex === 0) ? 0 : --updatedCommandsHistoryCurrentIndex);
    }

    let updatedInputText = commandsHistory[updatedCommandsHistoryCurrentIndex];
    setInputText(updatedInputText);
    setCommandsHistoryCurrentIndex(updatedCommandsHistoryCurrentIndex);
  }


 
  const clearTerminal = () => {
    setInputText("");
    setOutputs([]);
    setVariables({});
  }

  const showActionResult = (cliResponse: CliResponse, cliData: CliData) => {
    const updatedOutputs = [...outputs];
    const updatedCommandsHistory = [...commandsHistory];

    var commandOut: TerminalOut = { type: "text", message: ">" + inputText };
    var commandResultOut: TerminalOut = {
      type: cliResponse.type,
      data: cliResponse.response,
      message: cliResponse.message
    };

    if (cliData.cliOutput != null && cliData.cliOutput.render) {
      commandResultOut.type = cliData.cliOutput.format;
    }


    let updatedVariables = { ...variables };
    if (cliData.outputVariable) {
      updatedVariables[cliData.outputVariable] = cliResponse.response;
    }
    else {
      updatedVariables["result"] = cliResponse.response;
    }




    updatedOutputs.push(commandOut);
    updatedOutputs.push(commandResultOut);
    updatedCommandsHistory.push(inputText);


    setInputText("");
    setOutputs(updatedOutputs);
    setVariables(updatedVariables);
    setCommandsHistory(updatedCommandsHistory);
    setCommandsHistoryCurrentIndex(updatedCommandsHistory.length - 1);
  
  };





  const onTerminalInputChanged = async (ev: any) => {

    console.log(`Entering onchange event...`);
    const userInput = ev.target.value;
    const caretPos = ev.target.selectionStart;
    console.log(`Input caret position: ${caretPos}, UserInput:${userInput}`);
    setInputText(userInput);
    setInputCaretPosition(caretPos);

    let intellisenseInput: IntelliSenseInput = { inputText: userInput, inputCaretPosition: caretPos };

    let intellisenseInfo = await getIntelliSenseForText(intellisenseInput);
    intellisenseInfo.currentPos = calculateIntelliSensePos(caretPos);
    setIntelliSenseResults(intellisenseInfo);

  };




  return (
    <React.Fragment>
      <div className="terminalContainer" >
        <Terminal
          outputs={outputs}
          intelliSenseResults={intellisenseResults}
          terminalInputChange={(event: any) => onTerminalInputChanged(event)}
          terminalInputKeyDown={onTerminalInputKeyDown}
          terminalIntelliSenseItemClick={onTerminalIntellisenseItemClick}
          terminalInputBlur={onTerminalInputBlur}
          terminalInputRef={cliInputRef}
          inputText={inputText} spinner={spinnerInfo} />
      </div>
      <canvas ref={intelliSensePositionCanvasRef} className="posHelperCanvas" />
    </React.Fragment>
  );
};