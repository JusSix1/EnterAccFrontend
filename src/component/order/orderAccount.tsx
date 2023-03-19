import * as React from 'react';
import { DataGridPro, FilterColumnsArgs, GetColumnForNewFilterArgs, GridColDef, GridRowSelectionModel, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid-pro';
import { Alert, Button, Dialog, DialogActions, DialogTitle, Grid, Snackbar } from '@mui/material';
import Moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';

import ip_address from '../ip';
import { AccountsInterface } from '../../models/account/IAccount';
import UserFullAppBar from '../UserFullAppBar';

export default function Order_Account_UI() {
    const [account, setAccount] = React.useState<AccountsInterface[]>([]);

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);
    const [dialogOrderOpen, setDialogOrderOpen] = React.useState(false);

    const [year, setYear] = React.useState<Dayjs | null>(dayjs());

    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

    Moment.locale('th');

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport 
                csvOptions={{
                    fileName: 'EntaccMyAccount '+Moment(year?.toDate()).format('DD-MMMM-YYYY h.mm.ssa'),
                    delimiter: ';',
                    utf8WithBom: true,
                }}
            />
          </GridToolbarContainer>
        );
      }

    const columns: GridColDef[] = [
        { field: 'ID_Account', headerName: 'ID', width: 70},
        { field: 'Years', headerName: 'Years', width: 90, },
        { field: 'Twitter_Account', headerName: 'Twitter Account', width: 200 },
        { field: 'Twitter_Password', headerName: 'Twitter password', width: 200 },
        { field: 'Email', headerName: 'Email', width: 200 },
        { field: 'Email_Password', headerName: 'Email password', width: 200 },
        { field: 'Phone_Number', headerName: 'Phone number', width: 200 },
    ];   

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

    const handleDialogOrderClickOpen = () => {
        setDialogOrderOpen(true);
    };

    const handleDialogOrderClickClose = () => {
        setDialogOrderOpen(false);
    }
      
    const getUnsoldAccount = async () => {
        const apiUrl = ip_address() + "/unsold-account/"+localStorage.getItem('email'); // email คือ email ที่ผ่านเข้ามาทาง parameter
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
                    setAccount(res.data); 
                }
            });
    };

    const CreateOrder = async () => {    

        setDialogLoadOpen(true);

        var dataArr = [];

        for (var i = 0; i < rowSelectionModel.length; i++) {
            dataArr.push({
                Account_ID:         rowSelectionModel[i],
            });
        }

        const apiUrl = ip_address() + "/order/" + localStorage.getItem('email');                      //ส่งขอการแก้ไข
        const requestOptions = {     
            method: "POST",      
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
                handleDialogOrderClickClose();
                getUnsoldAccount();
            } else {
                setError(true);  
                setErrorMsg(" - "+res.error);  
            }
        });
        setDialogLoadOpen(false);
    }

    React.useEffect(() => {
        const fetchData = async () => {
            setDialogLoadOpen(true);
            await getUnsoldAccount();
            setDialogLoadOpen(false);
        }
        fetchData();
    }, []);

    return (
        <><UserFullAppBar /><Grid>
        <Grid>
            <Snackbar                                                                                 //ป้ายบันทึกสำเร็จ
                open={success}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleClose} severity="success">              
                    Succes
                </Alert>
            </Snackbar>

            <Snackbar                                                                                 //ป้ายบันทึกไม่สำเร็จ
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
                            rows={account}
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
                            }}
                            rowSelectionModel={rowSelectionModel}
                            disableRowSelectionOnClick
                            onCellDoubleClick={async (params, event) => {
                                await navigator.clipboard.writeText(String(params.formattedValue));
                                window.open("https://shadowban.yuzurisa.com/" + params.formattedValue , "_blank");
                              }}
                        />
                </div>
            </Grid>

            <Grid container sx={{ padding: 2 }}>
                <Grid sx={{ padding: 2 }}>
                        <Button variant="contained" color="secondary" onClick={() => handleDialogOrderClickOpen()}>Order Account</Button>
                </Grid>
            </Grid>

        <Dialog
                open={dialogOrderOpen}
                onClose={handleDialogOrderClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Order " + rowSelectionModel.length + " Account"}
                </DialogTitle>
            <DialogActions>
                <Button onClick={handleDialogOrderClickClose} color="inherit">Cancel</Button>
                <Button onClick={CreateOrder} color="success" autoFocus>Order</Button>
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
        </Grid></>
    );
}