This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

<!-- TODO: add steps for running it locally -->

## Notes

Steps that you should follow for testing:

- Sign in with google
- Once you are signin → create a passkey
- Logout
- Try to sign in with passkey
- it should allow you to signin

Important:

- it doesn’t handle if you try to create a passkey again, it only stores the user once but I didn’t add the logic for not allowing you to click there (when we implement it we have to check it)
- Didn’t test it that much with mobile/desktop. Will do it and add more information related to that. If you can please try it, and let me know if you can reuse the same passkey or have to add a new one in each device.
