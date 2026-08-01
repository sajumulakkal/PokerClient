import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.75rem 1.5rem;
  outline: none;
  border: 2px solid;
  background-color: transparent;
  border-image: linear-gradient(
      to bottom,
      ${(props) => props.theme?.colors?.borderFColor || '#21a68e'},
      ${(props) => props.theme?.colors?.borderSColor || '#0d3733'}
    )
    2;
  background-image: linear-gradient(
    to bottom,
    ${(props) => props.theme?.colors?.buttonFColor || '#187969'},
    ${(props) => props.theme?.colors?.buttonSColor || '#081c1c'}
  );
  background-origin: border-box;
  color: white;
  clip-path: polygon(
    0 5px,
    5px 0,
    calc(100% - 5px) 0,
    100% 5px,
    100% calc(100% - 5px),
    calc(100% - 5px) 100%,
    5px 100%,
    0% calc(100% - 5px),
    0% 5px
  );
  font-family: ${(props) => props.theme?.fonts?.fontFamilySansSerif || 'sans-serif'};
  font-weight: 400;
  font-size: 1.3rem;
  line-height: 1.3rem;
  min-width: 150px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
    filter: brightness(0.9);
  }

  &:focus {
    outline: none;
  }

  /* Visually indicate disabled state without breaking pointer event loops */
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed !important;
    filter: grayscale(80%);
    transform: none !important;
  }

  ${(props) =>
    props.primary &&
    css`
      padding: ${(props) => {
        if (props.large) return 'calc(1rem - 2px) calc(2rem - 2px)';
        else if (props.small) return 'calc(0.5rem - 2px) calc(1rem - 2px)';
        else return 'calc(0.75rem - 2px) calc(1.5rem - 2px)';
      }};
    `}

  ${(props) =>
    props.secondary &&
    css`
      &:focus {
        outline: none;
      }
    `}
  
  ${(props) =>
    props.large &&
    css`
      font-size: 1.6rem;
      line-height: 1.6rem;
      min-width: 250px;
      padding: 0.5rem 1rem;
    `}
  
  ${(props) =>
    props.small &&
    css`
      font-size: 1.1rem;
      line-height: 1.1rem;
      min-width: 100px;
      padding: 0.5rem 0.3rem;
    `}
  
  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  @media screen and (max-width: 1024px) {
    ${(props) =>
      props.large &&
      css`
        font-size: 1.4rem;
        line-height: 1.4rem;
        min-width: 200px;
        padding: 0.75rem 1.5rem;
      `}

    ${(props) =>
      (props.fullWidthOnMobile || props.fullWidth) &&
      css`
        width: 100%;
      `}
  }
`;

Button.propTypes = {
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  small: PropTypes.bool,
  large: PropTypes.bool,
  fullWidth: PropTypes.bool,
  fullWidthOnMobile: PropTypes.bool,
};

export default Button;
