import { GoogleLogin } from "@react-oauth/google";
import { useRef } from "react";

type Props = {
  onSuccess: (credential: string) => void;
};

export default function GoogleCustomButton({ onSuccess }: Props) {
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const handleCustomClick = () => {
    const googleBtn =
      hiddenContainerRef.current?.querySelector("div[role='button']");

    (googleBtn as HTMLElement)?.click();
  };

  return (
    <>
      {/* Hidden official Google button */}
      <div
        ref={hiddenContainerRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              onSuccess(credentialResponse.credential); // JWT
            }
          }}
          onError={() => {
            console.log("Google Login Failed");
          }}
        />
      </div>

      {/* Your custom button */}
      <button
        onClick={handleCustomClick}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Continue with Google
      </button>
    </>
  );
}
