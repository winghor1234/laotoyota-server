import admin from "firebase-admin";


const serviceAccount = {
    "type": "service_account",
    "project_id": "laos-toyota-service",
    "private_key_id": "6e9c2082ca77afbfa9c148b19b6efc0c9940e337",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDh7JE5yFK0RRV6\nfU8rPS7pRtQaGhi/ZPXo1AGFwJsTPcNeaICSQZIc8HMhCmEW8hXJiZzwULasTSb3\nvMy03p/MDT78kXGIOIzycjhPka4Zu+XJGczeG/q9r/35a4EcLxY1GoHG7IeC733z\nuQvkJ8P1r6vjEbuxQDbkXQqMIdkoHm75vJQkbq8UQrukcs2I8jeyJvPRudy1eVq8\nP2tu16dfetKL9xbMDLEzLMGQkLmtVvoZQMP4kU0aRlyaiExRJ27NrlMsu3UfwOhT\n4c9W+lc2l1j89uzhhgTlvTX0TNz6gtnZrj5iHoqbyia2wphvVQ0RonePK3nEXqQZ\nNASFEAHxAgMBAAECggEADJlILS9vwtzNZCDKNVbHbG8TBrrPOxeMVrKn73qi5Nfl\nzFIW+J3Oe6Db34seiFlX5kuVysyXFOG49OMvv6OTyFAx/U/qqfy/vQkQlqNaam+R\nH2QgcBk7in0R55xbcIprRx48zK6Sps/oBE6DJfLvv+sCTC3h4fJH48R3TgKlnQTt\nBmeeudHA7B0Ko4p2ZPtLbv3dS/Z6hxAjSu6v6AfHkZt5VsQRlis+TAF7nUNg1V/y\nHdTSMyqu8Txll3TEt0dJGGNGMS3+IqLwn3OZdR3Au11O5MmBB45WPUjbk5/5xTyM\nrdnNhnT+59ZB7ujGE4FfBbSfc5T7vCGEFGV7kB9pfwKBgQD1/dk52bYzLkiLd6Hq\ny2TD4jO8VQmEv7f9wxVRdF8ZNlfmpzQmGjYAqrwUEWcL77ObE44dVVk/O2Zb9/+3\nSouU2mPjJ/mfwxoJgKAskhnQzFapvAazF+k5ekztI21Vf1ZfzOEJndQTlz4HL9FX\njWKZGGadH6Td/iro7QJo0QwTdwKBgQDrHbQan6PKC3ud8lV0KyJvEGhCPMJE7OPL\nVYeRtxRzlfqnw2eYdEBbiOWZMaZI/uqNp20ey/PMye2jfznJ2EXSXbxrSy0fgSB+\n2QM+mBML41Nj13SAPIUDmH/6Rg7KRRiho/Mm8wgZI4ZN6hfX3rNaWiIkYG9vkt5E\nLSDHYIHf1wKBgA4NkntblK0X180f6IAhXoBSS+JWeVS8HybAHleo7kXidOMYakJC\n/RLMrjH3TIvCBeC2HUhPt+mE2zQl1tYBzDeUwmAXyIr3+mTQlFX3gsIK6miH9VoF\n460E76AchgJ8Y9LVQYXrHlKAMWr3sF3wFdHpMvOG+0QzYQAtihWy253BAoGATzDw\nCs+eYV1Aw9Bty/UDYhlKpJTGcmS/zSr/wKrDrrLjfEIq0ITHcI1JmDHK6mdCJXgx\nHuBfO6j/68PceQnpapO79P+bMTNS+KarmxepwqVM3yIg0ViRDMb+xBN4w9RGGZuZ\nOJM/NQhsIi4o3cLa8iHNwibhIdl8F8aDdeQhmn0CgYA5FLcazu2JgWKVISalRV0N\nixb3p5VJZAJLBzPBH+2/pEQXjvSPNzBT5VaQwLep+WK7HVWOQB0qHf0S58CDJHVQ\nHY1eVXlMsNV4LcCYuY0DKBcXpnTt7JzcQDVjaF8YRZSViZoDpRtVTd9GubwH7RIC\n9ZMmfyP8D8oIsC+xK8CcUA==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@laos-toyota-service.iam.gserviceaccount.com",
    "client_id": "100467431431444435073",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40laos-toyota-service.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}


const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
export default firebaseAdmin;