import { onRequestOptions as __api_email_subscribe_ts_onRequestOptions } from "/Users/tc/workspace/TradeSchools/functions/api/email/subscribe.ts"
import { onRequestPost as __api_email_subscribe_ts_onRequestPost } from "/Users/tc/workspace/TradeSchools/functions/api/email/subscribe.ts"
import { onRequestPost as __api_schools_submit_ts_onRequestPost } from "/Users/tc/workspace/TradeSchools/functions/api/schools/submit.ts"

export const routes = [
    {
      routePath: "/api/email/subscribe",
      mountPath: "/api/email",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_email_subscribe_ts_onRequestOptions],
    },
  {
      routePath: "/api/email/subscribe",
      mountPath: "/api/email",
      method: "POST",
      middlewares: [],
      modules: [__api_email_subscribe_ts_onRequestPost],
    },
  {
      routePath: "/api/schools/submit",
      mountPath: "/api/schools",
      method: "POST",
      middlewares: [],
      modules: [__api_schools_submit_ts_onRequestPost],
    },
  ]