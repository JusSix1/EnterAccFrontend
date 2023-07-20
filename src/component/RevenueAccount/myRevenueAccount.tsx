import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Snackbar, TextField } from '@mui/material';
import * as React from 'react';
import { RevenueInterface } from '../../models/revenue/IRevenue';
import ip_address from '../ip';
import { DataGridPro, FilterColumnsArgs, GetColumnForNewFilterArgs, GridColDef, GridRowSelectionModel, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid-pro';
import moment from 'moment';
import Moment from 'moment';
import UserFullAppBar from '../FullAppBar/UserFullAppBar';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function My_Revenue_Account_UI() {
    const [revenue, setRevenue] = React.useState<RevenueInterface[]>([]);
    const [revenueEdit, setRevenueEdit] = React.useState<Partial<RevenueInterface>>({});

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);
    const [dialogEditOpen, setDialogEditOpen] = React.useState(false);

    const [income, setIncome] = React.useState<Number | null>(null);
    const sum = revenue.reduce((acc, item) => acc + item.Income, 0);

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

    const columnsForRevenue: GridColDef[] = [
        { field: 'ID', headerName: 'ID', width: 70},
        { field: 'CreatedAt', headerName: 'Created At', width: 300, valueFormatter: params => 
        moment(params?.value).format("DD/MM/YYYY hh:mm A"),},
        { field: 'Income', headerName: 'Income/Expense', width: 300},
        { field: ' ', headerName: 'Edit', width: 200, renderCell: params => (
            <Button
                size='small'
                variant="contained"
                color="primary"
                onClick={() => handleEditButtonClick(params.row)}
            >
                Edit
            </Button>
        ),},
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

    const handleEditButtonClick = (revenue: any) =>{
        setRevenueEdit(revenue);
        setDialogEditOpen(true);
    }

    const handleEditClickClose = () =>{
        setDialogEditOpen(false);
    }

    const getMyRevenue = async () => {
        const apiUrl = ip_address() + "/revenue/"+localStorage.getItem('email'); // email คือ email ที่ผ่านเข้ามาทาง parameter
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
                    setRevenue(res.data); 
                }
            });
    };

    const PatchRevenue = () => {    
        let data = {
            ID:         revenueEdit.ID,
            Income:     income,
        };
        const apiUrl = ip_address() + "/revenue";                      //ส่งขอการแก้ไข
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
                getMyRevenue();
                handleEditClickClose();
            } else {
                setError(true);  
                setErrorMsg(" - "+res.error);  
            }
        });
    }


    React.useEffect(() => {
        const fetchData = async () => {
            setDialogLoadOpen(true);
            await getMyRevenue();
            setDialogLoadOpen(false);
        }
        fetchData();
    }, []);

    return(
        <><UserFullAppBar />
        <Grid>
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
            </Grid>
            <Grid container sx={{ padding: 2 }}>
                <div style={{ height: 540, width: '100%' }}>
                    <DataGridPro
                            rows={revenue}
                            getRowId={(row) => row.ID}
                            slots={{ toolbar: CustomToolbar }}
                            columns={columnsForRevenue}
                            slotProps={{
                                filterPanel: {
                                    filterFormProps: {
                                        filterColumns,
                                    },
                                    getColumnForNewFilter,
                                },
                            }}    
                        />
                </div>
            </Grid>
            <Grid container sx={{ marginX: 2 }}>
                <Grid container item xs={2}>
                    <h4>profit/loss</h4>
                </Grid>
                <Grid container item xs={1}>
                    <h4>{sum} ฿</h4>
                </Grid>
            </Grid> 
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
        
        <Dialog
                open={dialogEditOpen}
                onClose={handleEditClickClose}
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
                                        id="expenses"
                                        label="Expenses"
                                        type='number'
                                        variant="outlined"
                                        defaultValue={revenueEdit.Income}
                                        onChange={(event) => setIncome(Number(event.target.value))}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button size='small' onClick={PatchRevenue} autoFocus>Update</Button>
                    <Button size='small' onClick={handleEditClickClose} color="error" >Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}