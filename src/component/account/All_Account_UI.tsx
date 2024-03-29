import { Alert, Dialog, DialogTitle, Grid, Snackbar } from '@mui/material';
import { DataGridPro, FilterColumnsArgs, GetColumnForNewFilterArgs, GridColDef, GridRowSelectionModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from '@mui/x-data-grid-pro';
import React from 'react';
import AdminFullAppBar from '../FullAppBar/AdminFullAppBar';
import ip_address from '../ip';
import Moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';
import { AccountsImportInterface } from '../../models/account/IAccount_Import';

export default function All_Admin_UI() {
    
    const [account, setAccount] = React.useState<AccountsImportInterface[]>([]);

    const [date, setDate] = React.useState<Dayjs | null>(dayjs());

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

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
                    fileName: 'All Account '+ Moment(date?.toDate()).format('DD-MMMM-YYYY h.mm.ssa'),
                    utf8WithBom: true,
                }}
            />
          </GridToolbarContainer>
        );
      }

    const columns: GridColDef[] = [
        { field: 'ID', headerName: 'ID', width: 70},
        { field: 'ID_Account', headerName: 'ID_Account', width: 70},
        { field: 'User_ID', headerName: 'User_ID', width: 70},
        { field: 'Years', headerName: 'Years', width: 90, },
        { field: 'Account_Status_ID', headerName: 'Account_Status_ID', width: 100 },
        { field: 'Order_ID', headerName: 'Order_ID', width: 90 },
        { field: 'Twitter_Account', headerName: 'Twitter_Account', width: 200 },
        { field: 'Twitter_Password', headerName: 'Twitter_Password', width: 200 },
        { field: 'Email', headerName: 'Email', width: 200 },
        { field: 'Email_Password', headerName: 'Email_Password', width: 200 },
        { field: 'Phone_Number', headerName: 'Phone_Number', width: 200 },
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

    const getAllAccount = async () => {
        const apiUrl = ip_address() + "/all-account-admin";
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

    React.useEffect(() => {
        const fetchData = async () => {
            setDialogLoadOpen(true);
            await getAllAccount();
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
                        onRowSelectionModelChange={(newRowSelectionModel) => {
                            setRowSelectionModel(newRowSelectionModel);
                        } }
                        rowSelectionModel={rowSelectionModel} 
                        disableRowSelectionOnClick
                        />
                        
                </div>
            </Grid>
        
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