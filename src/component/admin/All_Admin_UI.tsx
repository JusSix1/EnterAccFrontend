import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Snackbar, TextField } from '@mui/material';
import { DataGridPro, FilterColumnsArgs, GetColumnForNewFilterArgs, GridColDef, GridRowSelectionModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid-pro';
import React from 'react';
import { AdminsInterface } from '../../models/admin/IAdmin';
import AdminFullAppBar from '../FullAppBar/AdminFullAppBar';
import ip_address from '../ip';
import Moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';

export default function All_Admin_UI() {
    
    const [admin, setAdmin] = React.useState<AdminsInterface[]>([]);

    const [date, setDate] = React.useState<Dayjs | null>(dayjs());
    const [adminCreate, setAdminCreate] = React.useState<string>("");
    const [passwordCreate, setPasswordCreate] = React.useState<string>("");
    const [confirmPasswordCreate, setConfirmPasswordCreate] = React.useState<string>("");

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

    const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);
    const [dialogCreateOpen, setDialogCreateOpen] = React.useState(false);
    const [dialogUpdateBigOpen, setDialogUpdateBigOpen] = React.useState(false);
    const [dialogDeleteOpen, setDialogDeleteOpen] = React.useState(false);

    Moment.locale('th');

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport 
                csvOptions={{
                    fileName: 'All Admin '+ Moment(date?.toDate()).format('DD-MMMM-YYYY h.mm.ssa'),
                    utf8WithBom: true,
                }}
            />
          </GridToolbarContainer>
        );
      }

    const columns: GridColDef[] = [
        { field: 'ID', headerName: 'ID', width: 100},
        { field: 'Admin_Name', headerName: 'Admin Name', width: 150},
        { field: 'Password', headerName: 'Password', width: 500},
        { field: 'Big', headerName: 'Rights', width: 150},
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

    const handleDialogCreateClickOpen = () => {
        setDialogCreateOpen(true);
    };

    const handleDialogCreateClickClose = () => {
        setDialogCreateOpen(false);
    };

    const handleDialogUpdateBigClickOpen = () => {
        setDialogUpdateBigOpen(true);
    };

    const handleDialogUpdateBigClickClose = () => {
        setDialogUpdateBigOpen(false);
    };

    const handleDialogDeleteClickOpen = () => {
        setDialogDeleteOpen(true);
    };

    const handleDialogDeleteClickClose = () => {
        setDialogDeleteOpen(false);
    };

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

    const getAllAdmin = async () => {
        const apiUrl = ip_address() + "/admin-list";
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
                    setAdmin(res.data); 
                }
            });
    };

    const submitCreate = async () => {
        

        if(passwordCreate == confirmPasswordCreate){
            setDialogLoadOpen(true);

            let data = {
                Admin_Name: adminCreate,
                Password:   passwordCreate,
                Bid:        false,
            };

            const apiUrl = ip_address() + "/admin";
            const requestOptions = {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            };
        
            await fetch(apiUrl, requestOptions)
                .then((response) => response.json())
                .then((res) => {
                    if (res.data) {
                        setAdmin(res.data); 
                        getAllAdmin();
                        handleDialogCreateClickClose();
                    }else {
                        setError(true);
                        setErrorMsg(String(res.error))
                    }
                });
            setDialogLoadOpen(false);
        }else{
            setError(true);
            setErrorMsg("รหัสผ่านไม่ตรงกัน");
        }
    };

    const UpdateBigAdmin = async () => {    

        setDialogLoadOpen(true);

        var dataArr = [];

        for (var i = 0; i < rowSelectionModel.length; i++) {
            dataArr.push({
                ID:                 rowSelectionModel[i],
            });
        }

        const apiUrl = ip_address() + "/admin-right/" + localStorage.getItem("Admin_Name");                      //ส่งขอการแก้ไข
        const requestOptions = {     
            method: "PATCH",      
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },     
            body: JSON.stringify(dataArr),
        };

        await fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then(async (res) => {      
            if (res.data) {
                setSuccess(true);
                handleDialogUpdateBigClickClose();
                getAllAdmin();
            } else {
                setError(true);  
                setErrorMsg(" - "+res.error);  
                handleDialogUpdateBigClickClose();
            }
        });
        setDialogLoadOpen(false);
    }

    const DeleteAdmin = async () => {    

        setDialogLoadOpen(true);

        var dataArr = [];

        for (var i = 0; i < rowSelectionModel.length; i++) {
            dataArr.push({
                ID:                 rowSelectionModel[i],
            });
        }

        const apiUrl = ip_address() + "/admin/" + localStorage.getItem("Admin_Name");                      //ส่งขอการแก้ไข
        const requestOptions = {     
            method: "DELETE",      
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },     
            body: JSON.stringify(dataArr),
        };

        await fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then(async (res) => {      
            if (res.data) {
                setSuccess(true);
                handleDialogDeleteClickClose();
                getAllAdmin();
            } else {
                setError(true);  
                setErrorMsg(" - "+res.error);  
                handleDialogDeleteClickClose();
            }
        });
        setDialogLoadOpen(false);
    }

    React.useEffect(() => {
        const fetchData = async () => {
            setDialogLoadOpen(true);
            await getAllAdmin();
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
                        rows={admin}
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
                        checkboxSelection
                        onRowSelectionModelChange={(newRowSelectionModel) => {
                            setRowSelectionModel(newRowSelectionModel);
                        } }
                        rowSelectionModel={rowSelectionModel} 
                        disableRowSelectionOnClick
                        />
                        
                </div>
            </Grid>

            <Grid container sx={{ padding: 2 }}>
                <Grid sx={{ padding: 2 }}>
                    <Button size='small' variant="contained" color="primary" onClick={() => handleDialogCreateClickOpen()}>Add Admin</Button>
                </Grid>
                <Grid sx={{ padding: 2 }}>
                    <Button size='small' variant="contained" color="secondary" onClick={() => handleDialogUpdateBigClickOpen()}>Update rights</Button>
                </Grid>
                <Grid sx={{ padding: 2 }}>
                    <Button size='small' variant="contained" color="error" onClick={() => handleDialogDeleteClickOpen()}>Delete Admin</Button>
                </Grid>
            </Grid>

            <Dialog
                open={dialogCreateOpen}
                onClose={handleDialogCreateClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">
                    {"Add ADMIN"}
                </DialogTitle>

                <DialogContent>
                <Box>
                    <Paper elevation={2} sx={{padding:2,margin:2}}>
                    <Grid container>
                        <Box sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="Admin_Name"
                            label="Admin Name"
                            name="Admin_Name"
                            autoComplete="Admin_Name"
                            autoFocus
                            onChange={(event) => setAdminCreate(String(event.target.value))}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="Password"
                            autoComplete="current-password"
                            onChange={(event) => setPasswordCreate(String(event.target.value))}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmpassword"
                            label="Confirm Password"
                            type="password"
                            id="ConfirmPassword"
                            autoComplete="current-password"
                            onChange={(event) => setConfirmPasswordCreate(String(event.target.value))}
                        />
                        </Box>
                    </Grid>
                    </Paper>
                </Box>
                </DialogContent>
                <DialogActions>
                    <Button size='small' onClick={handleDialogCreateClickClose} color="error">Cancel</Button>
                    <Button size='small' onClick={submitCreate} autoFocus>Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialogUpdateBigOpen}
                onClose={handleDialogUpdateBigClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Update rights Admin"}
                </DialogTitle>
                <DialogActions>
                    <Button size='small' onClick={handleDialogUpdateBigClickClose}>Cancel</Button>
                    <Button size='small' onClick={UpdateBigAdmin} color="error" autoFocus>Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialogDeleteOpen}
                onClose={handleDialogCreateClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Admin"}
                </DialogTitle>
                <DialogActions>
                    <Button size='small' onClick={handleDialogDeleteClickClose}>Cancel</Button>
                    <Button size='small' onClick={DeleteAdmin} color="error" autoFocus>Delete</Button>
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