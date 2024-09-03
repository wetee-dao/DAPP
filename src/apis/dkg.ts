import { dkgUrl } from "@/plugins/chain";
import { GraphqlClient } from "@/utils/gql";

const teeReportQuery = `query tee_report(
    $hash: String!
  ){
    tee_report(
      hash: $hash
    )
  }`;
  
  export const GetTeeReport = async (hash: string) => {
    hash = hash.replaceAll('0x', '')
    const response = await (new GraphqlClient(dkgUrl)).query({
      query: teeReportQuery,
      variables: { hash }
    })

    return JSON.parse(response.tee_report)
  };