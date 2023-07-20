import * as React from 'react';
import { Alert, Button, Container, FormControl, FormControlLabel, FormHelperText, FormLabel, IconButton, Radio, RadioGroup, Snackbar, TextField } from "@mui/material";
import { Box, Grid, Paper, Link } from '@mui/material';
import Moment from 'moment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Dialog,DialogTitle,DialogContent,DialogActions } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { GendersInterface } from '../../models/user/IGender';

import { useParams } from 'react-router-dom';

import { UsersInterface } from '../../models/user/IUser';
import ip_address from '../ip';
import UserFullAppBar from '../FullAppBar/UserFullAppBar';


const ITEM_HEIGHT = 40;

function User_Profile(){
    const { email } = useParams(); // ดึง parameter จาก url-parameter
    const [user, setUser] = React.useState<Partial<UsersInterface>>({});
    const [userEdit, setUserEdit] = React.useState<Partial<UsersInterface>>({});
    const [genders, setGenders] = React.useState<GendersInterface[]>([]);
    const [isDataLoaded, setIsDataloaded] = React.useState<boolean | null>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [imageString, setImageString] = React.useState<string | ArrayBuffer | null>(null);
    const [birthday, setBirthday] = React.useState<Dayjs | null>(dayjs());
    const [password, setPassword] = React.useState<string | null>(null);
    const [old_password, setOld_password] = React.useState<string | null>(null);
    const [new_password, setNew_password] = React.useState<string | null>(null);
    const [confirm_password, setConfirm_password] = React.useState<string | null>(null);

    const openOption = Boolean(anchorEl);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [dialogEditOpen, setDialogEditOpen] = React.useState(false);
    const [dialogEditPasswordOpen, setDialogEditPasswordOpen] = React.useState(false);
    const [dialogDeleteOpen, setDialogDeleteOpen] = React.useState(false);

    Moment.locale('th');

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
      ) => {
        if (reason === "clickaway") {
          return;
        }
        setSuccess(false);
        setError(false);
        setErrorMsg("")
      };

    const handleImageChange = (event: any) => {
        const image = event.target.files[0];
    
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            const base64Data = reader.result;
            setImageString(base64Data)
        }
    }

    const handleClickOption = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseOption = () => {
        setAnchorEl(null);
    };

    const handleDialogEditClickOpen = () => {
        setUserEdit(user);
        setBirthday(dayjs(user.Birthday));
        setImageString(user.Profile_Picture || null)
        setDialogEditOpen(true);
        setAnchorEl(null);
    };

    const handleDialogEditClickClose = () => {
        setDialogEditOpen(false);
    };

    const handleDialogEditPasswordClickOpen = () => {
        setDialogEditPasswordOpen(true);
        setAnchorEl(null);
    };

    const handleDialogEditPasswordClickClose = () => {
        setDialogEditPasswordOpen(false);
    };

    const handleDialogDeleteClickOpen = () => {
        setDialogDeleteOpen(true);
        setAnchorEl(null);
    };

    const handleDialogDeleteClickClose = () => {
        setDialogDeleteOpen(false);
    };
    

    const getUser = async () => {
        const apiUrl = ip_address() + "/user/"+email; // email คือ email ที่ผ่านเข้ามาทาง parameter
        const requestOptions = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        };
       
        await fetch(apiUrl, requestOptions)
            .then((response) => response.json())
            .then((res) => {
                if (res.data) {
                    setUser(res.data);
                }
            });
    };

    const getGender = async () => {
        const apiUrl = ip_address() + "/genders";
        const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        };
       
        await fetch(apiUrl, requestOptions)
            .then((response) => response.json())
            .then((res) => {
                if (res.data) {
                    setGenders(res.data);
                }
            });
      };

    const EditUser = () => {    
        let data = {
            Email: email,
            FirstName: userEdit.FirstName,
            LastName: userEdit.LastName,
            Profile_Name: userEdit.Profile_Name,
            Profile_Picture: imageString,
            Birthday: birthday,
            Phone_number: userEdit.Phone_number,
            Gender_ID: userEdit.Gender_ID,
        };
        const apiUrl = ip_address() + "/users";                      //ส่งขอการแก้ไข
        const requestOptions = {     
            method: "PATCH",      
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },     
            body: JSON.stringify(data),
        };

        fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then(async (res) => {      
            if (res.data) {
                setSuccess(true);
                getUser();
                handleDialogEditClickClose();
            } else {
                setError(true);  
                setErrorMsg(" - "+res.error);  
            }
        });
    }

    const EditPasswordAccount = async () => {    
        if(new_password == confirm_password){
            let data = {
                Email: email,
                OldPassword: old_password,
                NewPassword: new_password,
            };
            const apiUrl = ip_address() + "/usersPassword";                      //ส่งขอการแก้ไข
            const requestOptions = {     
                method: "PATCH",      
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },     
                body: JSON.stringify(data),
            };

            fetch(apiUrl, requestOptions)
            .then((response) => response.json())
            .then(async (res) => {      
                if (res.data) {
                    setSuccess(true);
                    getUser();
                    handleDialogEditPasswordClickClose();
                } else {
                    setError(true);  
                    setErrorMsg(" - "+res.error);  
                }
            });
        }else{
            setError(true);
            setErrorMsg("รหัสผ่านไม่ตรงกัน");
        }
    }

    const DeleteAccount = async () => {    
        let data = {
            Password: password,
        };
        const apiUrl = ip_address() + "/users/" + email;                      //ส่งขอการลบ
        const requestOptions = {     
            method: "DELETE",      
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },     
            body: JSON.stringify(data),
        };

        fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then(async (res) => {      
            if (res.data) {
                setSuccess(true);
                handleDialogDeleteClickClose();
                signout();
            } else {
                setError(true);  
                setErrorMsg(" - "+res.error);  
            }
        });
    }

    const signout = () => {
        localStorage.clear();
        window.location.href = "/";
      };

    React.useEffect(() => {
        const fetchData = async () => {
            await getUser();
            await getGender();
            setIsDataloaded(true);
        }
        fetchData();
    }, []);

    if(isDataLoaded) return (
        <><UserFullAppBar /><Container>
            <Snackbar //ป้ายบันทึกสำเร็จ

                open={success}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleClose} severity="success">
                    Succes
                </Alert>
            </Snackbar>

            <Snackbar //ป้ายบันทึกไม่สำเร็จ

                open={error}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleClose} severity="error">
                    Error {errorMsg}
                </Alert>
            </Snackbar>
            <Grid>
                <Grid container>
                    <Grid margin={2}>
                        <img src={`${user.Profile_Picture}`} width="250" height="250" /> {/** show base64 picture from string variable (that contain base64 picture data) */}
                    </Grid>
                    <Grid marginLeft={1} item xs={10}>
                        <Grid>
                            <h2>{user.Profile_Name}</h2>
                        </Grid>
                        <Grid item> {/** เอา Grid มาล็อคไม่ให้ component มันเด้งไปที่อื่น */}
                            <Box
                                component="div"
                                sx={{
                                    width: "100%",
                                    textOverflow: 'ellipsis', overflow: 'hidden',
                                    whiteSpace: 'break-spaces',
                                    my: 2,
                                    p: 1,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#101010' : 'grey.100',
                                    color: (theme) => theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                                    border: '1px solid',
                                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                                    borderRadius: 2,
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                }}
                            >{/** กำหนดให้เว้นบรรทัด auto จาก white space */}
                                {"Full name: " + user.FirstName + " " + user.LastName + "\n\n"}
                                {"Email: " + user.Email + "\n\n"}
                                {"Birthday: " + `${Moment(user.Birthday).format('DD MMMM YYYY')}` + "\n\n"}
                                {"Phone number: " + user.Phone_number + "\n\n"}
                                {"Gender: " + user.Gender?.Gender}
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton
                            aria-label="more"
                            id="long-button"
                            aria-controls={openOption ? 'long-menu' : undefined}
                            aria-expanded={openOption ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={handleClickOption}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            MenuListProps={{
                                'aria-labelledby': 'long-button',
                            }}
                            anchorEl={anchorEl}
                            open={openOption}
                            onClose={handleCloseOption}
                            PaperProps={{
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: '20ch',
                                },
                            }}
                        >
                            <MenuItem onClick={handleDialogEditClickOpen}>
                                edit
                            </MenuItem>
                            <MenuItem onClick={handleDialogEditPasswordClickOpen}>
                                Change Password
                            </MenuItem>
                            <MenuItem onClick={handleDialogDeleteClickOpen}>
                                Delete Account
                            </MenuItem>
                        </Menu>
                    </Grid>
                </Grid>
            </Grid>

            <Dialog
                open={dialogEditOpen}
                onClose={handleDialogEditClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Update Data"}
                </DialogTitle>

                <DialogContent>
                    <Box>
                        <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                            <Grid container>
                                <Grid container>
                                    <Grid margin={1} item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="firstname"
                                            label="First name"
                                            variant="outlined"
                                            defaultValue={user.FirstName}
                                            onChange={(event) => setUserEdit({ ...userEdit, FirstName: event.target.value })} />
                                    </Grid>
                                    <Grid margin={1} item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="lastname"
                                            label="Last name"
                                            variant="outlined"
                                            defaultValue={user.LastName}
                                            onChange={(event) => setUserEdit({ ...userEdit, LastName: event.target.value })} />
                                    </Grid>
                                </Grid>

                                <Grid container>
                                    <Grid margin={1} item xs={5}>
                                        <TextField
                                            fullWidth
                                            id="profile-name"
                                            label="Profile Name"
                                            variant="outlined"
                                            defaultValue={user.Profile_Name}
                                            onChange={(event) => setUserEdit({ ...userEdit, Profile_Name: event.target.value })} />
                                    </Grid>

                                    <Grid marginTop={1}>
                                        <Grid>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Birthday"
                                                    value={dayjs(user.Birthday)}
                                                    onChange={(newValue) => {
                                                        setBirthday(newValue);
                                                    } } />
                                            </LocalizationProvider>
                                        </Grid>
                                    </Grid>

                                    <Grid container>
                                        <Grid margin={1} item xs={5}>
                                            <TextField
                                                fullWidth
                                                id="phonr-number"
                                                label="Phone number"
                                                variant="outlined"
                                                defaultValue={user.Phone_number}
                                                onChange={(event) => setUserEdit({ ...userEdit, Phone_number: event.target.value })} />
                                        </Grid>
                                        <Grid marginTop={1}>
                                            <FormControl>
                                                <FormLabel id="radio-buttons-group-gender">Gender</FormLabel>
                                                <RadioGroup
                                                    aria-labelledby="radio-buttons-group-gender"
                                                    name="radio-buttons-group-gender"
                                                    onChange={(event) => setUserEdit({ ...userEdit, Gender_ID: Number(event.target.value) })}
                                                    defaultValue={user.Gender_ID}
                                                >
                                                    {genders.map((o) => (
                                                        <FormControlLabel
                                                            value={o.ID} // <---- pass a primitive id value, don't pass the whole object here
                                                            control={<Radio size="small" />}
                                                            label={o.Gender} />
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                    </Grid>


                                    <Grid item xs={12}>
                                        <h4>Profile Picture</h4>
                                        <Grid>
                                            <img src={`${imageString}`} width="250" height="250" />
                                        </Grid>
                                        <input type="file" onChange={handleImageChange} />
                                        <FormHelperText>recommend size is 250*250 pixels</FormHelperText>
                                    </Grid>

                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button size='small' onClick={handleDialogEditClickClose}>Cancel</Button>
                    <Button size='small' onClick={EditUser} color="error" autoFocus>Update Data</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialogEditPasswordOpen}
                onClose={handleDialogEditPasswordClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Change Password"}
                </DialogTitle>

                <DialogContent>
                    <Box>
                        <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                            <Grid container>
                                <Grid container>
                                    <Grid margin={1} item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="old_password"
                                            label="Old Password"
                                            variant="outlined"
                                            type="password"
                                            onChange={(event) => setOld_password(event.target.value)} />
                                    </Grid>
                                    <Grid margin={1} item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="new_password"
                                            label="New Password"
                                            variant="outlined"
                                            type="password"
                                            onChange={(event) => setNew_password(event.target.value)} />
                                    </Grid>
                                    <Grid margin={1} item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="confirnm_password"
                                            label="Confirm New Password"
                                            variant="outlined"
                                            type="password"
                                            onChange={(event) => setConfirm_password(event.target.value)} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button size='small' onClick={handleDialogEditPasswordClickClose}>Cancel</Button>
                    <Button size='small' onClick={EditPasswordAccount} color="error" autoFocus>Change Password</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialogDeleteOpen}
                onClose={handleDialogDeleteClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Account"}
                </DialogTitle>

                <DialogContent>
                    <Box>
                        <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                            <Grid container>
                                <Grid container>
                                    <Grid margin={1} item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="password"
                                            label="Password"
                                            variant="outlined"
                                            type="password"
                                            onChange={(event) => setPassword(event.target.value)} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button size='small' onClick={handleDialogDeleteClickClose}>Cancel</Button>
                    <Button size='small' onClick={DeleteAccount} color="error" autoFocus>Delete Password</Button>
                </DialogActions>
            </Dialog>
        </Container></>
    );
    return null;
}

export default User_Profile
