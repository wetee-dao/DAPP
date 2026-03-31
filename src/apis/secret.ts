import { CurrentSecretUrl } from "@/plugins/chain";
import { GraphqlClient } from "@/utils/gql";

const rsaQuery = `query{
    secret_rsa
  }`;

export const SecretRSA = async () => {
    const response = await (new GraphqlClient(CurrentSecretUrl())).query({
        query: rsaQuery,
    })

    return response
};

export const uploadSecret = async (index: string, value: string, hash: string, signer: string) => {
    const response = await (new GraphqlClient(CurrentSecretUrl())).query({
        query: `mutation{
            upload_secret(
                index: "${index}",
                secret: "${value}",
                hash: "${hash}",
                user: "${signer}",
            )
          }`,
    })
    console.log(response)

    return response
}

export const initDisk = async (index: string, signer: string) => {
    const response = await (new GraphqlClient(CurrentSecretUrl())).query({
        query: `mutation{
            init_disk_key(
                index: "${index}",
                user: "${signer}",
            )
        }`,
    })

    return response
}

const teeReportQuery = `query tee_report(
    $hash: String!
  ){
    tee_report(
      hash: $hash
    )
  }`;

export const GetTeeReport = async (hash: string) => {
    hash = hash.replaceAll('0x', '')
    const response = await (new GraphqlClient(CurrentSecretUrl())).query({
        query: teeReportQuery,
        variables: { hash }
    })

    return JSON.parse(response.tee_report)
};