import * as React from 'react';
import { DataGridPro, FilterColumnsArgs, GetColumnForNewFilterArgs, GridColDef, GridRowSelectionModel, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid-pro';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Snackbar } from '@mui/material';
import Moment from 'moment';

import ip_address from '../ip';
import { AccountsInterface } from '../../models/account/IAccount';
import { OrdersInterface } from '../../models/order/IOrder';
import UserFullAppBar from '../UserFullAppBar';
import moment from 'moment';

export default function My_Order_UI() {
    const [account, setAccount] = React.useState<AccountsInterface[]>([]);
    const [order, setOrder] = React.useState<OrdersInterface[]>([]);

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [dialogWatchOpen, setDialogWatchOpen] = React.useState(false);
    const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);

    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

    Moment.locale('th');

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
          </GridToolbarContainer>
        );
      }

    const columnsForOrder: GridColDef[] = [
        { field: 'ID', headerName: 'ID', width: 70},
        { field: 'CreatedAt', headerName: 'Created At', width: 300, valueFormatter: params => 
        moment(params?.value).format("DD/MM/YYYY hh:mm A"),}
    ];   

    const columnsForAccount: GridColDef[] = [
        { field: 'ID_Account', headerName: 'ID', width: 70},
        { field: 'Years', headerName: 'Years', width: 90, },
        { field: 'Order_ID', headerName: 'Order ID', width: 90 },
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

    const handleDialogWatchClickOpen = () => {
        setDialogWatchOpen(true);
    };

    const handleDialogWatchClickClose = () => {
        setDialogWatchOpen(false);
    };

    const ExportAsTextFile = async () => {
        setDialogLoadOpen(true);
        var data = ""
        for (var i = 0; i < account.length; i++) {
            data = data + "Twitter Account:  " + account[i].Twitter_Account + "\n"
            data = data + "Twitter Password: " + account[i].Twitter_Password + "\n"
            data = data + "Email:            " + account[i].Email + "\n"
            data = data + "Email Password:   " + account[i].Email_Password + "\n"
            data = data + "Phone Number:     " + account[i].Phone_Number + "\n\n"
        }

        var a = document.createElement("a");

        var blob = new Blob([data], {type: "text/plain;charset=utf-8"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "Twitter Order ID " + account[0].Order_ID;
        a.click();
        window.URL.revokeObjectURL(url);
        setDialogLoadOpen(false);
    };

    const CopyToClipboard = async () => {
        setDialogLoadOpen(true);
        var data = ""
        for (var i = 0; i < account.length; i++) {
            data = data + "Twitter Account:  " + account[i].Twitter_Account + "\n"
            data = data + "Twitter Password: " + account[i].Twitter_Password + "\n"
            data = data + "Email:            " + account[i].Email + "\n"
            data = data + "Email Password:   " + account[i].Email_Password + "\n"
            data = data + "Phone Number:     " + account[i].Phone_Number + "\n\n"
        }
        await navigator.clipboard.writeText(data);
        setDialogLoadOpen(false);
    };
      
    const getAccountInOrder= async (id: number) => {

        const apiUrl = ip_address() + "/account-in-order/" + id; // email คือ email ที่ผ่านเข้ามาทาง parameter
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

    const getMyOrder = async () => {
        const apiUrl = ip_address() + "/order/"+localStorage.getItem('email'); // email คือ email ที่ผ่านเข้ามาทาง parameter
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
                    setOrder(res.data); 
                }
            });
    };

    React.useEffect(() => {
        const fetchData = async () => {
            setDialogLoadOpen(true);
            await getMyOrder();
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
                            rows={order}
                            getRowId={(row) => row.ID}
                            slots={{ toolbar: CustomToolbar }}
                            columns={columnsForOrder}
                            slotProps={{
                                filterPanel: {
                                    filterFormProps: {
                                        filterColumns,
                                    },
                                    getColumnForNewFilter,
                                },
                            }}    
                            onCellDoubleClick={async (params, event) => {
                                setDialogLoadOpen(true)
                                await getAccountInOrder(params.row.ID);
                                setDialogLoadOpen(false)
                                handleDialogWatchClickOpen();
                              }}
                        />
                </div>
            </Grid>

            <Dialog
                open={dialogWatchOpen}
                onClose={handleDialogWatchClickClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth='xl'
            >
                <DialogTitle id="alert-dialog-title">
                    {"Export Account"}
                </DialogTitle>

                <DialogContent>
                    <Box>
                        <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                            <div style={{ height: 540, width: '100%' }}>
                                <DataGridPro
                                    rows={account}
                                    getRowId={(row) => row.ID}
                                    slots={{ toolbar: CustomToolbar }}
                                    columns={columnsForAccount}
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

                                    onCellDoubleClick={async (params, event) => {
                                        await navigator.clipboard.writeText(String(params.formattedValue));
                                        window.open("https://shadowban.yuzurisa.com/" + params.formattedValue , "_blank");
                                    }}
                                    />
                             </div>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogWatchClickClose}>Close</Button>
                    <Button onClick={ExportAsTextFile} color="secondary" autoFocus>Export to Text file</Button>
                    <Button onClick={CopyToClipboard} color="success" autoFocus>Copy to Clipboard</Button>
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