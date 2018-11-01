import React, { PureComponent } from 'react';

class CurrentTimePanel extends PureComponent {
  state = {
    currentTime: null,
  }

  componentDidMount() {
    this.clock = setInterval(this.timer, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.countdown);
  }

  timer = () => {
    const { moment } = this.props;
    this.setState({ currentTime: moment() });
  }

  render() {
    const { currentTime } = this.state;
    return currentTime == null ? null : currentTime.format("YYYY-MM-DD HH:mm:ss");
  }
}

export default CurrentTimePanel;