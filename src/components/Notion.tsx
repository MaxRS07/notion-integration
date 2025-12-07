import React from "react";

const NOTION_OAUTH_URL = "https://api.notion.com/v1/oauth/authorize";

type Props = {
    clientId: string;     // Your public integration client ID
    redirectUri: string;  // Must match what you set in Notion
};

export const NotionLoginButton: React.FC<Props> = ({ clientId, redirectUri }) => {
    const handleLogin = () => {
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            owner: "user", // or "workspace" if needed
        });

        // Redirect browser to Notion OAuth
        window.location.href = `${NOTION_OAUTH_URL}?${params.toString()}`;
    };

    return (
        <button onClick={handleLogin}>
            Connect to Notion
        </button>
    );
};
