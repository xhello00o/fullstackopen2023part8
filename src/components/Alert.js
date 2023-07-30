const { Dialog, DialogTitle, DialogContentText, DialogActions, Button, DialogContent } = require("@mui/material")


const Alert =({handleclose,alertitem})=>{

    console.log(alertitem!==null,"testing alert")

    if (!alertitem){
        return null
    }

    

    return(
        <Dialog onClose={handleclose} open={alertitem!==null}>
            <DialogTitle>
                {alertitem.title}
            </DialogTitle>
            <DialogContent>
            <DialogContentText>
                A new book {alertitem.value.title} by {alertitem.value.author.name} has been added
            </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleclose}> close</Button>
            </DialogActions>

        </Dialog>
    )
}

export default Alert