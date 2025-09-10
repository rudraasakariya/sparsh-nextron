/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Friend from '../index.jsx';

jest.mock('../../UploadFriend', () => () => <div data-testid="upload-friend" />);

describe('Friend component', () => {
  it('renders friend information', () => {
    const friend = { name: 'Jane Doe', email: 'jane@example.com', photoURL: 'url' };
    render(<Friend friend={friend} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});
