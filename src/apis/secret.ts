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

export const uploadSecret = async (index: string, value: string, sign: string, signer: string) => {
    const response = await (new GraphqlClient(CurrentSecretUrl())).query({
        query: `mutation{
            upload_secret(
                index: "${index}",
                secret: "${value}",
                sign: "${sign}",
                user: "${signer}",
            )
          }`,
    })

    return response
}
