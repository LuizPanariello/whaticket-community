import { useState, useContext, useEffect } from "react";

import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  Box
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AccountCircle from "@mui/icons-material/AccountCircle";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import { i18n } from "../translate/i18n";
import { Outlet } from "react-router-dom";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";

import ProtectedRoute from "../routes/ProtectedRoute";

const LoggedInLayout = () => {
  
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState<'permanent' | 'persistent' | 'temporary'>("persistent");
  
  const { user, handleLogout, loading } = useContext(AuthContext);

  useEffect(() => {
    if (document.body.offsetWidth < 600)
      setDrawerVariant("temporary");
    else 
      setDrawerVariant("persistent");
  }, [drawerOpen]);

  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600)
      setDrawerOpen(false);
  };

  if (loading)
    return <></>;

  return (
    <ProtectedRoute>
      <WhatsAppsProvider>
        <Box sx={{ display: 'flex' }}>
          <AppBar>
              <Toolbar variant="dense">
                <IconButton 
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={() => setDrawerOpen(open => !open)}
                >
                  <MenuIcon />
                </IconButton>

                <Typography
                  component="h1"
                  variant="h6"
                  color="inherit"
                  noWrap
                >
                  Becare {/* TODO passar whitelabel */}
                </Typography>
                  
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "end" }}>
                  {user.id && <NotificationsPopOver />}

                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>

                  <Menu 
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right", }}
                    transformOrigin={{ vertical: "top", horizontal: "right", }}
                    open={menuOpen}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={handleOpenUserModal}>
                      {i18n.t("mainDrawer.appBar.user.profile")}
                    </MenuItem>
                    <MenuItem onClick={handleClickLogout}>
                      {i18n.t("mainDrawer.appBar.user.logout")}
                    </MenuItem>
                  </Menu>
                </Box>

              </Toolbar>
          </AppBar>

              <Drawer variant={"temporary"} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div>
                  <IconButton onClick={() => setDrawerOpen(open => !open)}>
                    <ChevronLeftIcon />
                  </IconButton>
                </div>

                <Divider />

                <List>
                  <MainListItems drawerClose={drawerClose} />
                </List>
              </Drawer>

              <Box component="main" sx={{
                  flexGrow: 1,
                  minHeight: '100vh',
                  overflow: 'auto',
                  paddingTop: 10
                }}>
                  
                <Outlet />
              </Box>

              <UserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} userId={user?.id} />
              
          </Box>
        </WhatsAppsProvider>
      </ProtectedRoute>
  );
};

export default LoggedInLayout;
