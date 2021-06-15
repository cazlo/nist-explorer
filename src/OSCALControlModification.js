import React from "react";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import LayersIcon from "@material-ui/icons/Layers";
import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  OSCALControlModificationsButton: {
    color: "#002867",
  },
}));

/**
 * Create a typography html object for addsOrRemovesLabel
 *
 * @param {*} addsOrRemovesElements add or remove object to map into html
 * @param {*} addsOrRemovesLabel html text to display
 * @returns html object
 */
const getAlterAddsOrRemovesDisplay = (
  addsOrRemovesElements,
  addsOrRemovesLabel
) => {
  if (!addsOrRemovesElements?.length) {
    return null;
  }

  const typographies = addsOrRemovesElements
    .flatMap((element) => [...(element.props ?? []), ...(element.parts ?? [])])
    .map((item) => (
      <Typography color="textsecondary" paragraph="true" variant="body1">
        Name:{item.name}, Value:{item.value}
      </Typography>
    ));

  return (
    // TODO - consider making this into a table
    <DialogContentText
      color="textprimary"
      id="scroll-dialog-description"
      tabIndex={-1}
      variant="h6"
    >
      {addsOrRemovesLabel}
      {typographies}
    </DialogContentText>
  );
};

/**
 * Check if an element has a valid id.
 *
 * @param {*} controlId Control ID to match
 * @param {*} element Add/Remove element to check id of
 * @param {*} field Field of Add/Remove element to check
 * @returns true if element matches controlID
 */
const checkID = (controlId, element, field) => {
  // TODO: Differences in how NIST and FedRAMP implement adds makes
  // this check needed. See if we can clean this up at some point.
  // Assumes the difference is that NIST does not have a "control-id" field
  if (!element[field]) {
    return true;
  }

  // Throw out invalid id's
  if (element[field].includes("obj")) {
    return false;
  }

  return (
    element[field].concat("_smt") === controlId || element[field] === controlId
  );
};

/**
 * Get the modifications from the adds/removes list.
 *
 * @param {*} controlId Control Id to check compare element id's with
 * @param {*} modList List of modifications
 * @param {*} modText String to display type of modification
 * @returns an HTML element
 */
const getModifcations = (controlId, modList, modText) => {
  // Add everything with ids that match controlPartId
  const controlParts = modList.filter((element) =>
    checkID(controlId, element, "by-id")
  );

  // return display & mod length
  return [
    <DialogContent dividers>
      {getAlterAddsOrRemovesDisplay(controlParts, modText)}
    </DialogContent>,
    controlParts.length,
  ];
};

export default function OSCALControlModification(props) {
  if (!props.modifications || !props.modifications.alters) {
    return null;
  }

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // Finds the control-id within alters and matches it with a resolved control
  const alter = props.modifications.alters.find(
    (element) => element["control-id"] === props.control.id
  );

  let modificationsDisplay;
  let addsDisplay = null;
  let removesDisplay = null;
  let len;
  let modLength = 0;

  if (alter) {
    // Get all add modifications
    if (alter.adds) {
      [addsDisplay, len] = getModifcations(
        props.controlPartId,
        alter.adds,
        "Adds:"
      );
      modLength += len;
    }

    // Get all remove modifications
    if (alter.removes) {
      [removesDisplay, len] = getModifcations(
        props.controlPartId,
        alter.removes,
        "Removes:"
      );
      modLength += len;
    }
  }

  // Display if altered is true
  if (modLength) {
    modificationsDisplay = (
      <div>
        <Tooltip title="Modifications">
          <Badge
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            color="secondary"
            badgeContent={modLength}
            overlap="circle"
          >
            <IconButton
              variant="outlined"
              size="small"
              className={classes.OSCALControlModificationsButton}
              onClick={handleClick}
            >
              <LayersIcon />
            </IconButton>
          </Badge>
        </Tooltip>
        <Dialog
          open={open}
          onClose={handleClose}
          scroll="paper"
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
        >
          <DialogTitle id="scroll-dialog-title">Modifications</DialogTitle>
          {addsDisplay}
          {removesDisplay}
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  } else {
    modificationsDisplay = null;
  }

  return <div>{modificationsDisplay}</div>;
}
