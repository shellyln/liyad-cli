
const React = require('react');
const ReactDOMServer = require('react-dom/server');


class Hello extends React.Component {
    render() {
        return (React.createElement("div", {}, "hello"));
    }
}


exports.dom = React.createElement;
exports.flagment = React.Fragment;
exports.render = ReactDOMServer.renderToStaticMarkup;
exports.components = {
    Hello,
};
