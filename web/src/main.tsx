
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // Инициализация i18n
import { YMInitializer } from "react-yandex-metrika";

createRoot(document.getElementById("root")!).render(
  <>
    <YMInitializer
      accounts={[105095681]}
      options={{
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        ecommerce: "dataLayer",
        trackHash: true,
        params: {
          telegram_user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
        },
      }}
      version="2"
    />
    <App />
  </>
);
