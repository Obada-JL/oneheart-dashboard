import { DotLottieReact } from "@lottiefiles/dotlottie-react";
export default function MainPage() {
  return (
    <>
      <div
        style={{
          width: "1500px",
          display: "flex",
          alignItems: "center",
          height: "75vh",
          justifyContent: "center",
          flexDirection: "row-reverse",
        }}
      >
        <div>
          <DotLottieReact
            src="https://lottie.host/9492a228-9649-4f4b-9bd6-e0d3e2adc18b/KR4IWzq7gh.lottie"
            loop
            autoplay
          />
        </div>
        <div>
          <h2 className="text-center">
            اهلا بكم في لوحة التحكم <br /> الخاصة بفريق قلب واحد التطوعي
          </h2>
          <p className="text-center">
            بمكنكم البدء باختيار قسم من القائمة اعلاه
          </p>
        </div>
      </div>
    </>
  );
}
