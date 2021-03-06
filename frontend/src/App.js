import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BoxerKing from "./pages/BoxerKing";
//import pages
import Coin from "./pages/Coin";
import { CreateBoxer } from "./pages/CreateBoxer";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Marketplace from "./pages/Marketplace";
import Payment from "./pages/Payment";

// MUI theme configuration
const theme = createTheme({
    palette: {
        primary: {
            main: "#26354A",
        },
        secondary: {
            main: "#ffffff",
        },
        background: {
            default: "#26354A",
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container>
                <Router>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/coin" element={<Coin />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/boxer-king" element={<BoxerKing />} />
                        <Route path="/create-card" element={<CreateBoxer />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/payment" element={<Payment />} />
                    </Routes>
                </Router>
            </Container>
        </ThemeProvider>
    );
}

export default App;
