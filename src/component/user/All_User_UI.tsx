import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Snackbar, TextField } from '@mui/material';
import { DataGridPro, FilterColumnsArgs, GetColumnForNewFilterArgs, GridColDef, GridRowSelectionModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid-pro';
import React from 'react';
import AdminFullAppBar from '../FullAppBar/AdminFullAppBar';
import ip_address from '../ip';
import Moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';
import { UsersInterface } from '../../models/user/IUser';

export default function All_User_UI() {
    
    const [user, setUser] = React.useState<UsersInterface[]>([]);

    const [date, setDate] = React.useState<Dayjs | null>(dayjs());

    const [new_password, setNew_password] = React.useState<string | null>(null);
    const [confirm_password, setConfirm_password] = React.useState<string | null>(null);
    const [userID, setUserID] = React.useState<Number | null>(null);

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

    const [dialogChangePasswordOpen, setDialogChangePasswordOpen] = React.useState(false);
    const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);
    Moment.locale('th');

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport 
                csvOptions={{
                    fileName: 'All User '+ Moment(date?.toDate()).format('DD-MMMM-YYYY h.mm.ssa'),
                    utf8WithBom: true,
                }}
            />
          </GridToolbarContainer>
        );
      }

    const columns: GridColDef[] = [
        { field: 'ID', headerName: 'ID', width: 70},
        { field: 'Email', headerName: 'Email', width: 200},
        { field: 'FirstName', headerName: 'FirstName', width: 200},
        { field: 'LastName', headerName: 'LastName', width: 200},
        { field: ' ', headerName: 'Change Password', width: 200, renderCell: params => (
            <Button
                size='small'
                variant="contained"
                color="primary"
                onClick={() => handleChangeButtonClick(params.row)}
            >
                Change
            </Button>
        ),},
        { field: 'Profile_Name', headerName: 'Profile_Name', width: 200},
        { field: 'Phone_number', headerName: 'Phone_number', width: 200},
    ];  

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

    const handleChangeButtonClick = (revenue: any) =>{
        setUserID(revenue.ID);
        setDialogChangePasswordOpen(true);
    }

    const handleChangePasswordClickClose = () =>{
        setDialogChangePasswordOpen(false);
    }

    const getColumnForNewFilter = ({
        currentFilters,
        columns,
        }: GetColumnForNewFilterArgs) => {
            const filteredFields = currentFilters?.map(({ field }) => field);
            const columnForNewFilter = columns
            .filter(
                (colDef) => colDef.filterable && !filteredFields.includes(colDef.field),
                )
            .find((colDef) => colDef.filterOperators?.length);
            return columnForNewFilter?.field ?? null;
    };

    const filterColumns = ({ field, columns, currentFilters }: FilterColumnsArgs) => {
        // remove already filtered fields from list of columns
        const filteredFields = currentFilters?.map((item) => item.field);
        return columns
        .filter(
        (colDef) =>
            colDef.filterable &&
            (colDef.field === field || !filteredFields.includes(colDef.field)),
        )
        .map((column) => column.field);
    };

    const getAllUser = async () => {
        const apiUrl = ip_address() + "/all-User-admin";
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

    const PatchPassword = () => {    
        if(new_password == confirm_password){
            let data = {
                ID:              userID,         
                NewPassword:        new_password,
            };
            const apiUrl = ip_address() + "/passwordFromAdmin";                      //ส่งขอการแก้ไข
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
                    getAllUser();
                    handleChangePasswordClickClose();
                } else {
                    setError(true);  
                    setErrorMsg(" - "+res.error);  
                }
            });
        }
    }

    React.useEffect(() => {
        const fetchData = async () => {
            setDialogLoadOpen(true);
            await getAllUser();
            setDialogLoadOpen(false);
        }
        fetchData();
    }, []);
    
    return (
        <Grid>
            <AdminFullAppBar/>

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

            <Grid container sx={{ padding: 2 }}>
                <div style={{ height: 540, width: '100%' }}>
                    <DataGridPro
                        rows={user}
                        getRowId={(row) => row.ID}
                        slots={{ toolbar: CustomToolbar }}
                        columns={columns}
                        slotProps={{
                            filterPanel: {
                                filterFormProps: {
                                    filterColumns,
                                },
                                getColumnForNewFilter,
                            },
                        }}
                        onRowSelectionModelChange={(newRowSelectionModel) => {
                            setRowSelectionModel(newRowSelectionModel);
                        } }
                        rowSelectionModel={rowSelectionModel} 
                        disableRowSelectionOnClick
                        />
                        
                </div>
            </Grid>

            <Dialog
                open={dialogChangePasswordOpen}
                onClose={handleChangePasswordClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Import Account(.xlsx file)"}
                </DialogTitle>

                <DialogContent>
                    <Box>
                        <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                            <Grid container>
                                <Grid margin={1}>
                                    <TextField
                                        fullWidth
                                        id="new_password"
                                        label="New password"
                                        type='string'
                                        variant="outlined"
                                        onChange={(event) => setNew_password(event.target.value)}
                                    />
                                </Grid>
                                <Grid margin={1}>
                                    <TextField
                                        fullWidth
                                        id="confirm_password"
                                        label="Confirm password"
                                        type='string'
                                        variant="outlined"
                                        onChange={(event) => setConfirm_password(event.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button size='small' onClick={PatchPassword} autoFocus>Update</Button>
                    <Button size='small' onClick={handleChangePasswordClickClose} color="error" >Cancel</Button>
                </DialogActions>
            </Dialog>
        
            <Dialog
                open={dialogLoadOpen}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Loading..."}
                </DialogTitle>
            </Dialog>
        </Grid>
    );
}