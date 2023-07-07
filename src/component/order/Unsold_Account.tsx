import * as React from 'react';
import { DataGridPro, FilterColumnsArgs, GetColumnForNewFilterArgs, GridColDef, GridRowSelectionModel, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid-pro';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Snackbar, TextField } from '@mui/material';
import Moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';
import * as XLSX from 'xlsx';

import ip_address from '../ip';
import { AccountsInterface } from '../../models/account/IAccount';
import UserFullAppBar from '../FullAppBar/UserFullAppBar';
import { AccountsImportInterface } from '../../models/account/IAccount_Import';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function Order_Account_UI() {
    const [account, setAccount] = React.useState<AccountsInterface[]>([]);
    const [importAccount, setImportAccount] = React.useState<AccountsImportInterface[][]>([]);

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);
    const [dialogOrderOpen, setDialogOrderOpen] = React.useState(false);
    const [dialogCreateOpen, setDialogCreateOpen] = React.useState(false);

    const [year, setYear] = React.useState<Dayjs | null>(dayjs());
    const [imageString, setImageString] = React.useState<string | ArrayBuffer | null>(null);

    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

    const [expenses, setExpenses] = React.useState<Number | null>(null);

    Moment.locale('th');
    
    const handleDialogCreateClickOpen = () => {
        setDialogCreateOpen(true);
    };

    const handleDialogCreateClickClose = () => {
        setDialogCreateOpen(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json<AccountsImportInterface[]>(worksheet, { header: 1 });
            setImportAccount(json);
        };
        reader.readAsArrayBuffer(file);
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

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport 
                csvOptions={{
                    fileName: 'EntaccMyAccount '+Moment(year?.toDate()).format('DD-MMMM-YYYY h.mm.ssa'),
                    utf8WithBom: true,
                }}
            />
          </GridToolbarContainer>
        );
      }

    const columns: GridColDef[] = [
        { field: 'ID_Account', headerName: 'ID', width: 70},
        { field: 'Years', headerName: 'Years', width: 90, },
        { 
            field: 'Twitter_Account',
            headerName: 'Twitter Account',
            width: 200,
            renderCell: (params) => (
              <a href={`https://twitter.com/${params.value}`} target="_blank" rel="noopener noreferrer">
                {params.value}
              </a>
            ),
        },
        { field: ' ', headerName: 'Shadowbanned check', width: 200, renderCell: params => (
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleShadowbannedButtonClick(params.row.Twitter_Account)}
            >
                Check
            </Button>
        ),},
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

    const handleShadowbannedButtonClick = (account: string) => {
        window.open("https://hisubway.online/shadowban/?username=" + account , "_blank");
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

        if(rowSelectionModel.length == 0){
            setError(true);  
            setErrorMsg(" - No account selected"); 
        } else {

            setDialogLoadOpen(true);

            let dataSlip = {                                                            //ประกาศก้อนข้อมูล
                Slip: imageString,      
            };

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
                body: JSON.stringify({
                    accountToOrder: dataArr,
                    dataSlip: dataSlip
                  }),
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
            await CreateRevenue();
            setDialogLoadOpen(false);
        }
    }

    const CreateRevenue = async () => {    

        let data = {                                                            //ประกาศก้อนข้อมูล
            Income: expenses,      
        };

        const apiUrl = ip_address() + "/revenue/" + localStorage.getItem('email');                      //ส่งขอการแก้ไข
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
        .then(async (res) => {      
            if (res.data) {
                setSuccess(true);
            } else {
                setError(true);  
                setErrorMsg(" - "+res.error);  
            }
        });
        setExpenses(null);
    }

    const CreateAccount = async () => {   
        
        if(importAccount.length == 0){
            setError(true);  
            setErrorMsg(" - No file to import"); 
        } else {

            setDialogLoadOpen(true);

            var dataArr = [];

            for (var i = 1; i < importAccount.length; i++) {
                dataArr.push({
                    Email_User:         localStorage.getItem('email'),
                    Twitter_Account:    importAccount[i][0],
                    Twitter_Password:   importAccount[i][1],
                    Email_Accont:       importAccount[i][2],
                    Email_Password:     importAccount[i][3],
                    Phone_Number:       importAccount[i][4],
                    Years:              Number(`${Moment(year?.toDate()).format('YYYY')}`),
                    Account_Status_ID:  2,
                });
            }

            const apiUrl = ip_address() + "/account";                      //ส่งขอการแก้ไข
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
                    handleDialogCreateClickClose();
                    getUnsoldAccount();
                    setYear(dayjs());
                    setImportAccount([]);
                } else {
                    setError(true);  
                    setErrorMsg(" - "+res.error);  
                }
            });
            await CreateRevenue();
            setDialogLoadOpen(false);
        }
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
                        />
                </div>
            </Grid>

            <Grid container sx={{ padding: 2 }}>
                <Grid sx={{ padding: 2 }}>
                        <Button variant="contained" color="secondary" onClick={() => handleDialogOrderClickOpen()}>Order Account</Button>
                </Grid>

                <Grid sx={{ padding: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => handleDialogCreateClickOpen()}>Import Account</Button>
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
                    <Grid margin={1} item xs={5}>
                        <TextField
                            fullWidth
                            id="income"
                            label="Income"
                            type='number'
                            variant="outlined"
                            onChange={(event) => setExpenses(Number(event.target.value))}
                        />
                        <Grid item xs={12}> {/* Profile Picture */}
                            <h4>Slip</h4>
                            <Grid>
                                <img src={`${imageString}`} width="360" height="640"/> {/** show base64 picture from string variable (that contain base64 picture data) */}
                            </Grid>
                            <input type="file" onChange={handleImageChange} />
                        </Grid>
                    </Grid>
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

        <Dialog
                open={dialogCreateOpen}
                onClose={handleDialogCreateClickClose}
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
                                <Grid container>
                                    <Grid margin={1} item xs={5}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label={'Year'}
                                                openTo="year"
                                                views={['year']}
                                                defaultValue={year}
                                                onChange={(newValue) => {
                                                    setYear(newValue);
                                                } } />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid margin={1} item xs={5}>
                                        <TextField
                                            fullWidth
                                            id="expenses"
                                            label="Expenses"
                                            type='number'
                                            variant="outlined"
                                            onChange={(event) => setExpenses((Number(event.target.value))*(-1))}
                                        />
                                    </Grid>
                                    <Grid margin={1} item xs={12}>
                                        <input type="file" onChange={handleFileUpload} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogCreateClickClose}>Cancel</Button>
                    <Button onClick={CreateAccount} color="error" autoFocus>Import</Button>
                </DialogActions>
            </Dialog>

        </Grid>
        </Grid></>
    );
}