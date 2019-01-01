import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

const RouteDisplay = ({
  componentTitle,
  pathName,
  routeCompId,
  deleteRoute,
  classes,
  routerCompId,
  color,
}) => (
  <Grid container alignItems="baseline" align="stretch">
  {console.log('color: ', color)}
    <Grid item xs={10}
    style={{
      color,
    }}
    >
   
      Path: / {pathName}
      <br/>
      Component: {componentTitle}
    </Grid>
    <Grid item xs={2}>
    <IconButton
      className={classes.button}
      onClick={() => {
        deleteRoute({
          routeCompId,
          routerCompId,
        });
      }}
      aria-label='Delete'>
      <DeleteIcon
      style={{
        color,
      }} />
    </IconButton>
    </Grid>
  </Grid>
);

export default RouteDisplay;

RouteDisplay.propTypes = {
  deleteRoute: PropTypes.func.isRequired,
  routerCompId: PropTypes.string.isRequired,
  componentTitle: PropTypes.string.isRequired,
  pathName: PropTypes.string.isRequired,
  routeCompId: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};
