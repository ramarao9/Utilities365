import React, { useState, useRef, KeyboardEventHandler } from "react";

import { getCliData } from "../../services/CliParsingService";
import { PerformCrmAction } from "../../services/CLI/CrmCliService";
import { Terminal } from "../../components/UI/Terminal/Terminal";
import { CliResponse, CliResponseType } from "../../interfaces/CliResponse";
import { CliData } from "../../interfaces/CliData";
import { Spinner } from "../../interfaces/Spinner";
import { TerminalOut } from "../../interfaces/TerminalOut";
import { getIntelliSenseForText, getUpdatedInputOnSelection } from "../../services/CLI/IntelliSense/IntelliSenseService"
import "./CLI.css";

import { CliIntelliSense, CLIVerb, ClientRect, IntelliSenseInput } from "../../interfaces/CliIntelliSense";
import { CliInput } from "../../interfaces/CliInput";
import { text } from "stream/consumers";
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

  const getDefaultCliData = () => {
    return { rawInput: "", action: "", target: "", outputVariable: "", cliOutput: { render: false, format: "" } };

  }

  const cliInputRef = useRef();
  const intelliSensePositionCanvasRef = useRef(null);
  const [inputCaretPosition, setInputCaretPosition] = useState<number>(0);
  const [variables, setVariables] = useState<any>({});
  const [spinnerInfo, setSpinner] = useState<Spinner>({ show: false });
  const [inIntelliSenseNavMode, setIntelliSenseNavMode] = useState<boolean>(false);
  const [intelliSenseVerbCurrentIndex, setintelliSenseVerbCurrentIndex] = useState<number>(0);
  const [cliInput, setCliInput] = useState<CliInput>({ text: "", placeholder: "" });
  const [lastUserRequestCommand, setLastUserRequestCommand] = useState<CliData>(getDefaultCliData());
  const [outputs, setOutputs] = useState<Array<CliResponse>>([]);
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


    setCliInput({ text: updatedIntelliSenseInput.inputText });
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


  //Terminal Input key down event that handles the execution of the action on the target
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

    const cliDataVal = getCliData(cliInput.text) as CliData;
    let cliResponse: CliResponse = { type: CliResponseType.None, success: false, message: "" };

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
      updatedCommandsHistoryCurrentIndex = (cliInput.text === "") ? commandsHistoryArrLength - 1 :
        ((updatedCommandsHistoryCurrentIndex === 0) ? 0 : --updatedCommandsHistoryCurrentIndex);
    }

    let updatedInputText = commandsHistory[updatedCommandsHistoryCurrentIndex];
    setCliInput({ text: updatedInputText });
    setCommandsHistoryCurrentIndex(updatedCommandsHistoryCurrentIndex);
  }



  const clearTerminal = () => {
    setCliInput({ text: "", placeholder: "" });
    setOutputs([]);
    setVariables({});
  }

  const showActionResult = (cliResponse: CliResponse, cliData: CliData) => {
    const updatedOutputs = [...outputs];
    const updatedCommandsHistory = [...commandsHistory];



    var commandOut: CliResponse = { type: CliResponseType.TEXT, message: ">" + cliInput.text, success: true };
    if (cliData.steps && cliData.steps.length > 0) {
      //For multi input responses, we do not want the additional inputs to start with >, as this should only be used for displaying top levels commands
      commandOut.message = cliInput.text;
    }
    else {
      updatedCommandsHistory.push(cliInput.text);// We only want to push the commands but not the input to the commands
    }
    updatedOutputs.push(commandOut);


    if (cliData.cliOutput != null && cliData.cliOutput.render) {
      cliResponse.type = cliData.cliOutput.format.toUpperCase() as CliResponseType;
    }


    let updatedVariables = { ...variables };
    if (cliData.outputVariable) {
      updatedVariables[cliData.outputVariable] = cliResponse.response;
    }
    else {
      updatedVariables["result"] = cliResponse.response;
    }







    if (cliResponse.type === CliResponseType.RequestAdditionalUserInput || cliResponse.type === CliResponseType.RequestAdditionalMultiLineUserInput) {
      setCliInput({
        text: "",
        placeholder: cliResponse.userInputMessage,
        isMultiline: cliResponse.type === CliResponseType.RequestAdditionalMultiLineUserInput,
        isPartOfMultiInputRequest: true
      });

    }
    else {
      updatedOutputs.push(cliResponse);
      setCliInput({ text: "", placeholder: "" });

    }

    setLastUserRequestCommand(cliData);
    setOutputs(updatedOutputs);
    setVariables(updatedVariables);
    setCommandsHistory(updatedCommandsHistory);
    setCommandsHistoryCurrentIndex(updatedCommandsHistory.length - 1);



  };




  //Used to provide Intellisense during on change of the text field
  const onTerminalInputChanged = async (ev: any) => {

    console.log(`Entering onchange event...`);
    const userInput = ev.target.value;
    const caretPos = ev.target.selectionStart;
    console.log(`Input caret position: ${caretPos}, UserInput:${userInput}`);
    setCliInput({ text: userInput });
    setInputCaretPosition(caretPos);

    let intellisenseInput: IntelliSenseInput = { inputText: userInput, inputCaretPosition: caretPos };

    let intellisenseInfo = await getIntelliSenseForText(intellisenseInput);
    intellisenseInfo.currentPos = calculateIntelliSensePos(caretPos);
    setIntelliSenseResults(intellisenseInfo);

  };

  const onTerminalAdditionalInputChange = async (ev: React.ChangeEvent<HTMLTextAreaElement>) => {



    const userInput = ev.target.value;

    setCliInput({
      text: userInput,
      placeholder: cliInput.placeholder,
      step: cliInput.step,
      isMultiline: cliInput.isMultiline,
      isPartOfMultiInputRequest: cliInput.isPartOfMultiInputRequest
    });



  }


  const onTerminalAdditionalInputKeyDown = async (ev: React.KeyboardEvent<HTMLElement> | undefined) => {


    if (ev?.key !== 'Enter')
      return;


    ev.currentTarget.blur();

    showProgressSpinner();
    let cliData = getCliDataWhenMultiInput(lastUserRequestCommand, cliInput);

    let cliResponse = await PerformCrmAction(cliData);
    showActionResult(cliResponse, cliData);
    hideProgressSpinner();

  }


  const getCliDataWhenMultiInput = (cliData: CliData, cliInput: CliInput): CliData => {


    if (!cliData.steps)
      cliData.steps = [];

    if (!cliInput.step) {
      cliInput.step = 1;
    }
    else {
      cliInput.step += 1;
    }


    cliData.steps?.push(cliInput);
    return cliData;

  }


  return (
    <React.Fragment>
      <div className="terminalContainer" >
        <Terminal
          outputs={outputs}
          terminalAdditionalInputChange={onTerminalAdditionalInputChange}
          terminalAdditionalInputKeyDown={onTerminalAdditionalInputKeyDown}
          intelliSenseResults={intellisenseResults}
          terminalInputChange={(event: any) => onTerminalInputChanged(event)}
          terminalInputKeyDown={onTerminalInputKeyDown}
          terminalIntelliSenseItemClick={onTerminalIntellisenseItemClick}
          terminalInputBlur={onTerminalInputBlur}
          terminalInputRef={cliInputRef}
          cliInput={cliInput} spinner={spinnerInfo} />
      </div>
      <canvas ref={intelliSensePositionCanvasRef} className="posHelperCanvas" />
    </React.Fragment>
  );
};