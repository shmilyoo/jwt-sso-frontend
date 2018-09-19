import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import compose from 'recompose/compose';
import classNames from 'classnames';
import { types as accountTypes } from '../reducers/account';
import {
  withStyles,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  Person as UserIcon,
  PowerSettingsNew as LogoutIcon
} from '@material-ui/icons';
import LeftNav from '../components/LeftNav';
import Info from './account/Info';
import { sysName, leftMenu } from '../config';

const drawerWidth = 250;

const style = theme => ({
  homeRoot: {
    height: '100%',
    width: '100%'
  },

  right: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    height: '100%',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  rightShift: {
    width: '100%',
    marginLeft: 0
  },
  main: {
    padding: 20,
    flex: 'auto'
  },
  footer: {
    padding: 10,
    textAlign: 'right'
  },
  white: {
    color: 'white'
  }
});

class Home extends React.Component {
  state = {
    leftOpen: true
  };
  logout = () => {
    this.props.dispatch({ type: accountTypes.SAGA_LOGOUT_REQUEST });
  };

  render() {
    console.log('render home');
    const { classes, title } = this.props;
    return (
      <div className={classes.homeRoot}>
        <LeftNav menu={leftMenu} open={this.state.leftOpen} header={sysName} />
        <div
          className={classNames(classes.right, {
            [classes.rightShift]: !this.state.leftOpen
          })}
        >
          <div className={classes.header}>
            <AppBar color="secondary" position="static">
              <Toolbar style={{ display: 'flex' }}>
                <IconButton
                  onClick={() => {
                    this.setState({ leftOpen: !this.state.leftOpen });
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography style={{ flex: 'auto' }} variant="title">
                  {title}
                </Typography>
                <IconButton>
                  <UserIcon />
                </IconButton>
                <Tooltip title="注销">
                  <IconButton onClick={this.logout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </AppBar>
          </div>
          <div className={classes.main}>
            <Switch>
              <Route path="/account/info" component={Info} />
              <Route path="/account/passwd" component={null} />
              <Route path="/about" component={null} />
            </Switch>
          </div>
          <div className={classes.footer}>@copyright 2018</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    username: state.account.username,
    title: state.common.title
  };
}

export default compose(
  withStyles(style),
  connect(mapStateToProps)
)(Home);
