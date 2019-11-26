import React from 'react';
import Media from 'react-bootstrap/Media';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Spinner } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import { server, api } from '../../server';

interface ILisingDetails {
  id: number,
  description: string,
  image: string,
  price: number,
  quantity_sold: number,
  status: boolean,
  stock_count: number,
  thumbnail: string,
  title: string,
  user_id: number,
  category: number,
}

interface IProps extends RouteComponentProps<any> {}
interface IStates {
  listing: ILisingDetails | null;
  quantity: number;
  error: boolean,
}

class ListingDetails extends React.Component<IProps, IStates> {
  public readonly state: Readonly<IStates> = {
    listing: null,
    quantity: 1,
    error: false,
  };

  public async componentDidMount() {
    const { match } = this.props;
    const { id } = match.params;
    try {
      const resp = await server.get(
        `${api.listings_details}${id}`,
      );
      console.log(resp);
      if (resp.data.listing) {
        this.setState({
          listing: resp.data.listing,
        });
      }
    } catch (e) {
      this.setState({ error: true });
    }
  }

  public onAddToCart = () => {
    const { quantity, listing } = this.state;

    // API STUFF FOR ADDING TO THE ITEM TO USER'S CART
  }

  public render() {
    const { listing, error } = this.state;

    return (
      listing
        ? (
          <div className="listing-details">
            <Media>
              <Container>
                <Row className="mb-5">
                  <Col xs={12} lg={6} className="image-container">
                    <Image className="image" src={listing.image} fluid />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Media.Body>
                      <div className="purchase-details">
                        <h3>{listing.title}</h3>
                        <h4 className="listing-price">
                          {`$${listing.price}`}
                        </h4>
                        <p className="mt-4">{`Category: ${listing.category}`}</p>
                        <p>{`Available Quantity: ${listing.stock_count}`}</p>
                        <hr />
                        <p className="mb-5">{listing.description}</p>
                        Quantity:
                        <input type="number" className="ml-3 styled-input" onKeyDown={() => false} onChange={(e:any) => { this.setState({ quantity: e.target.value }); }} max={listing.stock_count} min={1} defaultValue={1} />
                        <br />
                        <Button variant="warning" className="styled-button mt-4" onClick={this.onAddToCart}>ADD TO CART</Button>
                      </div>
                    </Media.Body>
                  </Col>
                </Row>
                <span className="mt-5">Review Component Ova Here</span>
              </Container>
            </Media>

          </div>
        )
        : error
          ? <span>This listing does not exist!</span>
          : <Spinner animation="border" variant="warning" />


    );
  }
}

export default ListingDetails;
