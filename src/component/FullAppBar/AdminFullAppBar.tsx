import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import TwitterIcon from '@mui/icons-material/Twitter';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';


import { Link as RouterLink } from "react-router-dom";
import { Avatar } from '@mui/material';

function AdminFullAppBar() {
  const signout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  function drawerList() {
    return (
      <List sx={{ width: "100%" }}>

        <ListItem button component={RouterLink} to="/">
          <AdminPanelSettingsIcon />
          <ListItemText primary="All Admin" sx={{ paddingLeft: 1 }} />
        </ListItem>

        <ListItem button component={RouterLink} to="/All-User">
          <AccountCircleIcon />
          <ListItemText primary="All User" sx={{ paddingLeft: 1 }} />
        </ListItem>

        <ListItem button component={RouterLink} to="/All-Account">
          <FormatListBulletedIcon />
          <ListItemText primary="All Account" sx={{ paddingLeft: 1 }} />
        </ListItem>

        <ListItem button component={RouterLink} to="/All-Order">
          <BookmarkBorderIcon />
          <ListItemText primary="All Order" sx={{ paddingLeft: 1 }} />
        </ListItem>

      </List>
    );
  }

  const [auth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <Box sx={{ flexGrow: 1 }}>

      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>

            <TwitterIcon color="primary" sx={{ fontSize: 150, margin: 1, padding: 2 }} />
            {/** List of Drawer Divided by position */}
            {drawerList()}

          </Drawer>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EnterAcc
          </Typography>

          {auth && (                                                                               /* รูป Icon Profild */
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                  <Avatar alt="Remy Sharp" />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={signout} component={RouterLink} to="/" >Logout</MenuItem>
              </Menu>
            </div>
          )}

        </Toolbar>
      </AppBar>

    </Box>

  );
}

export default AdminFullAppBar;