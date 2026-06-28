const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-2_pS4w10tak",
      userPoolClientId: "23ebank3oc33d57cbrle78j52q",
      region: "us-east-2",
      identityPoolId: "us-east-2:4f1e9d74-eaed-4541-997a-dbeb1d6706ae"
    }
  }
};

export const API_BASE_URL = "https://m0odmfn1g8.execute-api.us-east-2.amazonaws.com";
export const RECEIPTS_BUCKET = "cloudtrack-receipts-harsh2026";
export const AWS_REGION = "us-east-2";

export default awsConfig;