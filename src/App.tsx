import { useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "./contexts/AuthContext";
import { TradingProvider } from "./contexts/TradingContext";
import Header from "./components/Header";
import TradingPairs from "./components/TradingPairs";
import ChartPanel from "./components/ChartPanel";
import TradingPanel from "./components/TradingPanel";
import AccountInfo from "./components/AccountInfo";

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [isPairsPanelVisible, setIsPairsPanelVisible] = useState(true);

  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "cmkt79gdw012ui50c0lwtjti4"}
      config={{
        loginMethods: ["wallet", "email", "sms"],
        appearance: {
          theme: "dark",
          accentColor: "#FF6B35",
        },
      }}
    >
      <AuthProvider>
      <TradingProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex h-[calc(100vh-64px)] relative">
            {/* 左侧交易对列表 */}
            <TradingPairs
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
              isVisible={isPairsPanelVisible}
              onVisibilityChange={setIsPairsPanelVisible}
            />

            {/* 中间图表区域 */}
            <div
              className={`flex-1 flex flex-col transition-all ${!isPairsPanelVisible ? "ml-0" : ""}`}
            >
              <ChartPanel symbol={selectedSymbol} />
            </div>

            {/* 右侧交易面板和账户信息 */}
            <div className="w-80 flex flex-col border-l border-border">
              <TradingPanel symbol={selectedSymbol} />
              <AccountInfo />
            </div>
          </div>
        </div>
      </TradingProvider>
      </AuthProvider>
    </PrivyProvider>
  );
}

export default App;
