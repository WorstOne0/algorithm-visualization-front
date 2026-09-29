"use client";

// Models
import { SIGNATURES, type SignatureId } from "@/core/models";
// Components
import AutocompletePage from "./autocomplete";
import DidYouMeanPage from "./did_you_mean";
import MongoIndexPage from "./mongo_index";
import NpmOrderPage from "./npm_order";
import ParanaRoadsPage from "./parana_roads";
import TicTacToePage from "./tic_tac_toe";
import TrafficPage from "./traffic";

export default function SignatureView({ signatureId }: { signatureId: SignatureId }) {
  const signature = SIGNATURES.find((candidate) => candidate.id === signatureId)!;

  switch (signatureId) {
    case "mongoIndex":
      return <MongoIndexPage signature={signature} />;
    case "autocomplete":
      return <AutocompletePage signature={signature} />;
    case "npmOrder":
      return <NpmOrderPage signature={signature} />;
    case "didYouMean":
      return <DidYouMeanPage signature={signature} />;
    case "paranaRoads":
      return <ParanaRoadsPage signature={signature} />;
    case "ticTacToe":
      return <TicTacToePage signature={signature} />;
    case "traffic":
      return <TrafficPage signature={signature} />;
  }
}
