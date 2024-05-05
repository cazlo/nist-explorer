import React from "react";
import Typography from "@mui/material/Typography";
import resolveLinkHref from "./oscal-utils/OSCALLinkUtils";

export default function OSCALDiagram(props) {
  // Just grab the first rlink for now
  const link = props.diagram?.links[0];
  if (!link) {
    throw new Error("no rlink found");
  }

  let diagramUri;
  try {
    diagramUri = resolveLinkHref({
      backMatter: props.backMatter,
      href: link.href,
      mediaType: /^image\//,
      parentUrl: props.parentUrl.startsWith(".") ? null : props.parentUrl,
      preferBase64: false,
    });
  } catch (err) {
    // Silently fail on unresolved diagram resources
    diagramUri = link.href;
  }

  return (
    <>
      <img src={diagramUri} alt={props.diagram.caption} style={{ maxWidth: "100%" }} />
      <Typography variant="caption" display="block" align="center" gutterBottom>
        {props.diagram.caption}
      </Typography>
    </>
  );
}
